import "dotenv/config"
import { DataSourceOptions } from "typeorm"
import { User } from "./entities/User"
import { Todo } from "./entities/Todo"
import path from "path"

export const typeormConfig: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: process.env.NODE_ENV === "development",
    logging: process.env.NODE_ENV === "development",
    entities: [User, Todo],
    migrations: [path.join(__dirname, "./migrations/*.{ts,js}")],
    subscribers: [],
}
