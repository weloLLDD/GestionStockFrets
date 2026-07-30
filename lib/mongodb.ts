import mongoose from "mongoose"

// Nettoyage : retire espaces et guillemets accidentels autour de la valeur collée
function sanitizeUri(raw: string | undefined): string | undefined {
  if (!raw) return raw
  let uri = raw.trim()
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1).trim()
  }
  return uri
}

const MONGODB_URI = sanitizeUri(process.env.MONGODB_URI)

if (!MONGODB_URI) {
  throw new Error("La variable d'environnement MONGODB_URI n'est pas définie.")
}

if (!/^mongodb(\+srv)?:\/\//.test(MONGODB_URI)) {
  throw new Error(
    "MONGODB_URI invalide : la chaîne doit commencer par 'mongodb://' ou 'mongodb+srv://'. " +
      "Exemple : mongodb+srv://utilisateur:motdepasse@cluster0.xxxxx.mongodb.net/fretdepot",
  )
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Cache global pour éviter de recréer des connexions en dev (hot reload)
declare global {
  var _mongoose: MongooseCache | undefined
}

const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null }

if (!global._mongoose) {
  global._mongoose = cached
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string, {
      bufferCommands: false,
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null
    throw err
  }

  return cached.conn
}
