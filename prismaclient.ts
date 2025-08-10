var prisma: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient()
  }
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  return global.prisma
}

export async function createProduct(data: Prisma.ProductCreateInput) {
  const prisma = getPrismaClient()
  return prisma.product.create({ data })
}

export async function updateProduct(
  id: number,
  data: Prisma.ProductUpdateInput
) {
  const prisma = getPrismaClient()
  return prisma.product.update({
    where: { id },
    data,
  })
}

export async function deleteProduct(id: number) {
  const prisma = getPrismaClient()
  return prisma.product.delete({
    where: { id },
  })
}

export async function getProduct(id: number) {
  const prisma = getPrismaClient()
  return prisma.product.findUnique({
    where: { id },
  })
}