import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm"

export class InitialMigration1699932800000 implements MigrationInterface {
    name = 'InitialMigration1699932800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create User table
        await queryRunner.createTable(
            new Table({
                name: "user",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "username",
                        type: "varchar",
                        isUnique: true,
                    },
                    {
                        name: "password",
                        type: "varchar",
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        )

        // Create Todo table
        await queryRunner.createTable(
            new Table({
                name: "todo",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "description",
                        type: "varchar",
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "dueDate",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "completed",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "userId",
                        type: "int",
                    },
                ],
            }),
            true
        )

        // Add foreign key
        await queryRunner.createForeignKey(
            "todo",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
                onDelete: "CASCADE",
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // First drop the foreign key
        const table = await queryRunner.getTable("todo")
        const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf("userId") !== -1)
        if (foreignKey) {
            await queryRunner.dropForeignKey("todo", foreignKey)
        }

        // Then drop the tables
        await queryRunner.dropTable("todo")
        await queryRunner.dropTable("user")
    }
}
