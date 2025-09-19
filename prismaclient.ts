interface ProductRecord {
  id: number
  title: string
  description: string
  price: number
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, unknown>
}

let currentId = 1
const products = new Map<number, ProductRecord>()

function now(): Date {
  return new Date()
}

export async function createProduct(data: Omit<ProductRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductRecord> {
  const record: ProductRecord = {
    ...data,
    id: currentId++,
    createdAt: now(),
    updatedAt: now(),
  }
  products.set(record.id, record)
  return record
}

export async function updateProduct(
  id: number,
  data: Partial<Omit<ProductRecord, 'id' | 'createdAt'>>,
): Promise<ProductRecord> {
  const existing = products.get(id)
  if (!existing) {
    throw new Error(`Product with id ${id} not found`)
  }
  const updated: ProductRecord = {
    ...existing,
    ...data,
    updatedAt: now(),
  }
  products.set(id, updated)
  return updated
}

export async function deleteProduct(id: number): Promise<void> {
  products.delete(id)
}

export async function getProduct(id: number): Promise<ProductRecord | null> {
  return products.get(id) ?? null
}

export async function listProducts(): Promise<ProductRecord[]> {
  return Array.from(products.values())
}
