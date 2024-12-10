import "reflect-metadata"
import { DataSource } from "typeorm"
import { typeormConfig } from "./typeorm.config"

const AppDataSource = new DataSource(typeormConfig)

// Function to initialize database with retries
export async function initializeDatabase(retries = 5, delay = 5000): Promise<DataSource> {
    for (let i = 0; i < retries; i++) {
        try {
            const connection = await AppDataSource.initialize();
            console.log("Database connection established successfully");
            return connection;
        } catch (error) {
            console.log(`Failed to connect to database (attempt ${i + 1}/${retries}):`, error);
            if (i === retries - 1) throw error;
            console.log(`Retrying in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error("Failed to connect to database after multiple retries");
}

export default AppDataSource
