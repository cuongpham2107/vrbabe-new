(() => {
  const { PrismaClient } = require("@prisma/client");
  const bcrypt = require('bcrypt')
  const prisma = new PrismaClient();
  
  async function main() {
    const permissions = await prisma.$transaction([
      {
        key: 'browse',
        tableName: 'admin'
      },
      {
        key: 'create',
        tableName: 'admin'
      },
      {
        key: 'edit',
        tableName: 'admin'
      },
      {
        key: 'delete',
        tableName: 'admin'
      },
      {
        key: 'image',
        tableName: 'admin'
      },
      {
        key: 'browse',
        tableName: 'role'
      },
      {
        key: 'create',
        tableName: 'role'
      },
      {
        key: 'edit',
        tableName: 'role'
      },
      {
        key: 'delete',
        tableName: 'role'
      },
      {
        key: 'image',
        tableName: 'role'
      }
    ].map(v => prisma.permission.create({
      data: v
    })))

    const role = await prisma.role.create({
      data: {
        name: 'Administrator',
        permissions: {
          create: permissions.map(v =>
            ({
              permission: {
                connectOrCreate: {
                  where: {
                    key_tableName: {
                      key: v.key,
                      tableName: v.tableName
                    }
                  },
                  create: {
                    key: v.key,
                    tableName: v.tableName
                  }
                }
              }
            })
          )
        }
      }
    })

    const password = await bcrypt.hash("password", 10)
    const user = await prisma.admin.create({
      data: {
        name: 'Admin',
        email: 'admin@admin.com',
        roleId: role.id,
        password
      }
    })
    
    console.log('Successfully')
  }
  
  main()
    .then(async () => {
      await prisma.$disconnect()
    })
    .catch(async (e) => {
      console.error(e)
      await prisma.$disconnect()
      process.exit(1)
    })
})()