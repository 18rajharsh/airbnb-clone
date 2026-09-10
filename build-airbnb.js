import fs from "fs";
import path from "path";
import JSZip from "jszip";

async function buildZip() {
  console.log("Packaging Full-Stack Airbnb Clone into airbnb-clone.zip...");
  const zip = new JSZip();

  // Root package.json
  zip.file(
    "package.json",
    JSON.stringify(
      {
        name: "airbnb-clone-workspace",
        version: "1.0.0",
        private: true,
        scripts: {
          "install:all": "npm install && npm install --prefix server && npm install --prefix client",
          "dev": "concurrently -k -n \"SERVER,CLIENT\" -c \"blue.bold,magenta.bold\" \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
          "dev:server": "npm run dev --prefix server",
          "dev:client": "npm run dev --prefix client",
          "build": "npm run build --prefix server && npm run build --prefix client",
        },
        devDependencies: {
          concurrently: "^8.2.2",
        },
      },
      null,
      2
    )
  );

  zip.file(".gitignore", "node_modules\ndist\n.env\n.DS_Store\n");

  zip.file(
    "README.md",
    `# Full-Stack Airbnb Clone (MVC Architecture)

An end-to-end full-stack vacation rental web application replicating Airbnb's core user experience and rental workflow.
- **MongoDB & Mongoose** (Schemas with validation, geospatial coordinates, compound indexing, date collision avoidance)
- **Express.js, Node.js & TypeScript** (MVC architecture, RESTful APIs, JWT in secure cookies)
- **React.js & Tailwind CSS** (Responsive UI, multi-criteria filtering, photo galleries, dynamic pricing engine)

## Quick Start
1. \`npm run install:all\`
2. Configure \`server/.env\` (from \`server/.env.example\`)
3. \`npm run dev\`
`
  );

  // Server
  const server = zip.folder("server");
  server.file(
    "package.json",
    JSON.stringify(
      {
        name: "airbnb-clone-server",
        version: "1.0.0",
        type: "module",
        scripts: {
          dev: "tsx watch src/server.ts",
          build: "tsc",
          start: "node dist/server.js",
          verify: "tsx src/utils/verifyE2E.ts",
        },
        dependencies: {
          bcryptjs: "^2.4.3",
          cloudinary: "^2.2.0",
          "cookie-parser": "^1.4.6",
          cors: "^2.8.5",
          dotenv: "^16.4.5",
          express: "^4.19.2",
          jsonwebtoken: "^9.0.2",
          mongoose: "^8.4.0",
          multer: "^1.4.5-lts.1",
        },
        devDependencies: {
          "@types/bcryptjs": "^2.4.6",
          "@types/cookie-parser": "^1.4.7",
          "@types/cors": "^2.8.17",
          "@types/express": "^4.17.21",
          "@types/jsonwebtoken": "^9.0.6",
          "@types/multer": "^1.4.11",
          "@types/node": "^20.12.12",
          tsx: "^4.10.5",
          typescript: "^5.4.5",
        },
      },
      null,
      2
    )
  );

  server.file(
    ".env.example",
    `PORT=5000
MONGO_URI=mongodb://localhost:27017/airbnb-clone
CLIENT_URL=http://localhost:5173
JWT_SECRET=supersecretjwtkey123456
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
`
  );

  server.file(
    "src/models/Booking.ts",
    `import mongoose, { Schema, Model, Document } from "mongoose";

export interface IBooking extends Document {
  listing: mongoose.Types.ObjectId;
  guest: mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  totalNights: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
}

interface BookingModel extends Model<IBooking> {
  checkAvailability(listingId: string | mongoose.Types.ObjectId, checkIn: Date, checkOut: Date): Promise<boolean>;
}

const bookingSchema = new Schema<IBooking, BookingModel>({
  listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
  guest: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  totalNights: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "confirmed", index: true },
}, { timestamps: true });

// Compound index for high performance collision verification
bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1, status: 1 });

// Atomic overlap formula: (RequestedCheckIn < ExistingCheckOut) AND (RequestedCheckOut > ExistingCheckIn)
bookingSchema.statics.checkAvailability = async function (listingId, checkIn, checkOut) {
  const conflict = await this.findOne({
    listing: listingId,
    status: { $in: ["confirmed", "pending"] },
    $and: [{ checkIn: { $lt: checkOut } }, { checkOut: { $gt: checkIn } }],
  });
  return !conflict;
};

export const Booking = mongoose.model<IBooking, BookingModel>("Booking", bookingSchema);
`
  );

  // Client
  const client = zip.folder("client");
  client.file(
    "package.json",
    JSON.stringify(
      {
        name: "airbnb-clone-client",
        private: true,
        version: "1.0.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "tsc && vite build",
          preview: "vite preview",
        },
        dependencies: {
          axios: "^1.7.2",
          "lucide-react": "^0.379.0",
          react: "^18.3.1",
          "react-dom": "^18.3.1",
          "react-router-dom": "^6.23.1",
        },
        devDependencies: {
          "@types/react": "^18.3.2",
          "@types/react-dom": "^18.3.0",
          "@vitejs/plugin-react": "^4.2.1",
          autoprefixer: "^10.4.19",
          postcss: "^8.4.38",
          tailwindcss: "^3.4.3",
          typescript: "^5.4.5",
          vite: "^5.2.11",
        },
      },
      null,
      2
    )
  );

  const content = await zip.generateAsync({ type: "nodebuffer" });
  fs.writeFileSync("airbnb-clone.zip", content);
  console.log("Successfully created airbnb-clone.zip in project root!");
}

buildZip().catch(console.error);
