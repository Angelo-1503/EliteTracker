import mongoose from 'mongoose';

const { MONGO_URL: mongoUrl } = process.env;

export async function setupMongo() {
	try {
		if (mongoose.connection.readyState === 1) {
			return;
		}

		console.log('🎲 Connecting to database... ');
		await mongoose.connect(String(mongoUrl), {
			serverSelectionTimeoutMS: 3000,
		});
		console.log('✔ Database Connected! ');
	} catch (err) {
		console.error('❌ Database not connected.');
	}
}
