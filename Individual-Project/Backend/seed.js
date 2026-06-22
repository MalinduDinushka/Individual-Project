const mongoose = require('mongoose');
const User = require('./models/User');
const Booking = require('./models/Booking');
const SOSAlert = require('./models/SOSAlert');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tourmate');
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({ role: 'admin' });
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@tourmate.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@tourmate.com');
      console.log('Use existing password or reset it');
    } else {
      // Create admin user
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@tourmate.com',
        password: 'admin123',
        role: 'admin',
        phone: '+94771234567',
        isVerified: true,
        isActive: true
      });

      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@tourmate.com');
      console.log('Password: admin123');
    }

    // Create some sample tourists
    const tourists = await User.find({ role: 'tourist' });
    if (tourists.length === 0) {
      await User.create([
        {
          name: 'John Doe',
          email: 'tourist1@example.com',
          password: 'password123',
          role: 'tourist',
          phone: '+94771234568',
          isVerified: true,
          isActive: true
        },
        {
          name: 'Jane Smith',
          email: 'tourist2@example.com',
          password: 'password123',
          role: 'tourist',
          phone: '+94771234569',
          isVerified: true,
          isActive: true
        }
      ]);
      console.log('✅ Sample tourists created');
    }

    // Create some sample providers
    const providers = await User.find({ role: 'provider' });
    if (providers.length === 0) {
      await User.create([
        {
          name: 'Kasun Perera',
          email: 'provider1@example.com',
          password: 'password123',
          role: 'provider',
          phone: '+94771234570',
          isVerified: false,
          isActive: true,
          businessInfo: {
            businessName: 'Kasun Tours & Travels',
            description: 'Professional tour guide service',
            serviceType: 'guide',
            location: 'Galle',
            documents: [
              {
                name: 'Business License',
                url: 'https://example.com/doc1.pdf',
                status: 'pending'
              }
            ]
          }
        },
        {
          name: 'Luxury Villas LK',
          email: 'provider2@example.com',
          password: 'password123',
          role: 'provider',
          phone: '+94771234571',
          isVerified: false,
          isActive: true,
          businessInfo: {
            businessName: 'Luxury Villas Lanka',
            description: 'Premium villa accommodation',
            serviceType: 'hotel',
            location: 'Mirissa',
            documents: [
              {
                name: 'Property License',
                url: 'https://example.com/doc2.pdf',
                status: 'pending'
              }
            ]
          }
        },
        {
          name: 'Safari Tours Lanka',
          email: 'provider3@example.com',
          password: 'password123',
          role: 'provider',
          phone: '+94771234572',
          isVerified: false,
          isActive: true,
          businessInfo: {
            businessName: 'Safari Adventures',
            description: 'Wildlife safari experiences',
            serviceType: 'guide',
            location: 'Yala',
            documents: []
          }
        },
        {
          name: 'Nimai Silva',
          email: 'provider4@example.com',
          password: 'password123',
          role: 'provider',
          phone: '+94771234573',
          isVerified: false,
          isActive: true,
          businessInfo: {
            businessName: 'Silva Transport Services',
            description: 'Reliable vehicle rental',
            serviceType: 'vehicle',
            location: 'Colombo',
            documents: [
              {
                name: 'Drivers License',
                url: 'https://example.com/doc3.pdf',
                status: 'pending'
              }
            ]
          }
        }
      ]);
      console.log('✅ Sample providers created');
    }

    // Create some sample bookings - Skip for now as it requires services
    // Note: Bookings will be created when services are added
    console.log('⏭️  Skipping bookings (requires services to be created first)');

    // Create sample SOS alerts
    const sosAlerts = await SOSAlert.find();
    if (sosAlerts.length < 2) {
      const sampleTourist = await User.findOne({ role: 'tourist' });
      
      if (sampleTourist) {
        await SOSAlert.create([
          {
            tourist: sampleTourist._id,
            location: {
              latitude: 7.8731,
              longitude: 80.7718,
              address: 'Kandy, Central Province'
            },
            emergencyType: 'lost',
            description: 'Lost in the mountains, need assistance',
            contactNumber: sampleTourist.phone,
            status: 'active',
            priority: 'high'
          },
          {
            tourist: sampleTourist._id,
            location: {
              latitude: 7.9553,
              longitude: 81.0185,
              address: 'Nuwara Eliya, Central Province'
            },
            emergencyType: 'accident',
            description: 'Vehicle breakdown on the way to Nuwara Eliya',
            contactNumber: sampleTourist.phone,
            status: 'in-progress',
            priority: 'medium'
          }
        ]);
        console.log('✅ Sample SOS alerts created');
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Admin Login Credentials:');
    console.log('Email: admin@tourmate.com');
    console.log('Password: admin123');
    console.log('\n✨ You can now login as admin!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
