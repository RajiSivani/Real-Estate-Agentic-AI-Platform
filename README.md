# 🏠⚓ HomePort - AI-Powered Real Estate Workflow Platform

**Your safe harbor in real estate** - A dual-sided platform connecting sellers and buyers through intelligent AI workflows.

---

## 🎯 Project Overview

HomePort is an AI-native real estate platform featuring two role-based portals:

### **Seller's Bridge** 🏛️
Where listing agents prepare, price, and market properties with AI assistance.

**Key Features:**
- ✨ AI-generated marketing content (social posts, MLS descriptions, brochures)
- 📸 Vision-based property improvement suggestions
- 💰 Smart pricing strategy with comparable sales analysis
- 📬 Real-time offer management with AI-powered recommendations
- ✅ Accept/Reject/Counter offer workflow

### **Buyer's Compass** 🧭
Where buyers find, evaluate, and negotiate their perfect home.

**Key Features:**
- 🔍 Intelligent property matching based on preferences
- 📊 Fair value analysis with comparable sales
- 💡 AI-powered negotiation strategy
- 📤 One-click offer submission
- ⚡ Real-time status updates

---

## 🏗️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide React icons

**Backend:**
- FastAPI (Python)
- Pydantic for validation

**Database & Services:**
- Supabase (PostgreSQL, Auth, Storage, Realtime)

**AI:**
- Claude API (Anthropic) for text generation and vision analysis

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Supabase Account** (free tier works)
- **Claude API Key** from Anthropic

---

## 🚀 Setup Instructions

### **Step 1: Clone the Repository**

```bash
git clone <your-repo-url>
cd homeport
```

---

### **Step 2: Database Setup (Supabase)**

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `database/schema.sql`
   - Execute the SQL

3. **Seed comparable homes data:**
   - In SQL Editor, copy contents of `database/seed_comps.sql`
   - Execute the SQL

4. **Enable Realtime:**
   - Go to Database → Replication
   - Enable replication for `notifications` and `offers` tables

5. **Configure Storage:**
   - Go to Storage → Create bucket
   - Name: `property-images`
   - Make bucket public

6. **Create test user accounts:**
   - Go to Authentication → Users → Add User
   - Create two users:
     - Email: `seller@demo.com`, Password: `demo123`
     - Email: `buyer@demo.com`, Password: `demo123`
   
7. **Insert user profiles:**
   After creating users, note their UUIDs from the auth.users table, then run:
   ```sql
   INSERT INTO profiles (id, email, full_name, role, phone)
   VALUES 
     ('<seller-uuid>', 'seller@demo.com', 'Sarah Johnson', 'seller', '408-555-0100'),
     ('<buyer-uuid>', 'buyer@demo.com', 'Mike Chen', 'buyer', '408-555-0200');
   ```

8. **Get Supabase credentials:**
   - Go to Settings → API
   - Note down:
     - Project URL
     - Anon/Public Key
     - Service Role Key (for backend)

---

### **Step 3: Backend Setup**

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

5. **Configure environment variables in `.env`:**
   ```env
   # Supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   
   # Anthropic
   ANTHROPIC_API_KEY=your-claude-api-key
   
   # CORS (for local development)
   CORS_ORIGINS=http://localhost:3000
   
   # Optional
   ENVIRONMENT=development
   ```

6. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   Backend will run at `http://localhost:8000`
   API docs at `http://localhost:8000/docs`

---

### **Step 4: Frontend Setup**

1. **Open a new terminal and navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env.local file:**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables in `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   Frontend will run at `http://localhost:3000`

---

## 🎬 Running the Demo

### **Access the Application**

1. **Landing Page:** `http://localhost:3000`
2. **Login as Seller:** Use `seller@demo.com` / `demo123`
3. **Login as Buyer:** Use `buyer@demo.com` / `demo123`

---

### **5-Minute Demo Flow**

#### **Part 1: Seller's Bridge (3 minutes)**

1. **Login as Seller:**
   - Click "Get Started as Seller" → Login
   - Email: `seller@demo.com` / Password: `demo123`

2. **Create New Listing:**
   - Navigate to "New Listing"
   - Fill in property details:
     - Address: `123 Main St, San Jose, CA 95123`
     - Price: `$450,000`
     - 3 bedrooms, 2 bathrooms, 2100 sq ft
     - Property type: Single Family
   - Upload 2-3 property images (use sample photos)

3. **Generate Marketing Content:**
   - Click "Generate Marketing Content"
   - Watch AI create social posts, MLS description, brochure copy

4. **Get Vision Analysis:**
   - Click "Analyze Images"
   - Review AI-powered improvement suggestions

5. **View Pricing Strategy:**
   - Click "Get Pricing Strategy"
   - Review comparable sales analysis
   - See recommended price range

6. **Publish Listing:**
   - Review all content
   - Click "Publish Listing"

#### **Part 2: Buyer's Compass (2 minutes)**

7. **Switch to Buyer Account:**
   - Logout from Seller's Bridge
   - Login as Buyer: `buyer@demo.com` / `demo123`

8. **Search for Properties:**
   - Enter preferences:
     - Budget: `$400K - $500K`
     - Location: `San Jose`
     - 3+ bedrooms, 2+ bathrooms
   - Click "Find Matches"

9. **Evaluate Property:**
   - Click on the listing you just created
   - Review AI value evaluation
   - See negotiation strategy

10. **Send Offer:**
    - Click "Send Offer"
    - Enter offer amount: `$445,000`
    - Add message: `We love this home and can close quickly`
    - Submit offer

#### **Part 3: Real-Time Notification (30 seconds)**

11. **Switch Back to Seller:**
    - Login as Seller again
    - Notice notification badge (real-time!)
    - Navigate to "Offers" page

12. **Review & Respond:**
    - See incoming offer with AI analysis
    - View AI recommendation
    - Click "Accept" / "Reject" / "Counter"

---

## 📁 Project Structure

```
homeport/
├── frontend/                    # Next.js application
│   ├── app/                     # App router pages
│   │   ├── page.tsx            # Landing page
│   │   ├── auth/               # Login pages
│   │   ├── sellers-bridge/     # Seller dashboard
│   │   └── buyers-compass/     # Buyer dashboard
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn components
│   │   ├── seller/             # Seller-specific components
│   │   └── buyer/              # Buyer-specific components
│   └── lib/                    # Utilities & API client
│
├── backend/                     # FastAPI application
│   └── app/
│       ├── main.py             # FastAPI app
│       ├── routers/            # API endpoints
│       ├── services/           # Business logic
│       └── models/             # Pydantic models
│
└── database/
    ├── schema.sql              # Database schema
    └── seed_comps.sql          # Seed data
```

---

## 🧪 Testing

### **Backend Tests**
```bash
cd backend
pytest
```

### **Frontend Development**
```bash
cd frontend
npm run dev     # Development server
npm run build   # Production build
npm run lint    # ESLint
```

---

## 🐛 Troubleshooting

### **Backend won't start**
- Check Python version: `python --version` (should be 3.9+)
- Verify virtual environment is activated
- Check .env file has all required variables
- Test Supabase connection: `curl $SUPABASE_URL/rest/v1/`

### **Frontend won't connect to backend**
- Verify backend is running on port 8000
- Check NEXT_PUBLIC_API_URL in .env.local
- Check CORS settings in backend .env

### **Supabase RLS errors**
- Verify user is authenticated
- Check RLS policies in Supabase dashboard
- Ensure user role is set correctly in profiles table

### **Claude API errors**
- Verify ANTHROPIC_API_KEY is correct
- Check API quota/limits
- Review error logs in backend console

### **Images won't upload**
- Check Supabase Storage bucket is created
- Verify bucket is public
- Check bucket name matches code (`property-images`)

### **Real-time notifications not working**
- Enable Realtime in Supabase Dashboard
- Check browser console for subscription errors
- Verify user_id matches authenticated user

---

## 🚢 Deployment (Optional)

### **Frontend (Vercel)**
```bash
cd frontend
vercel --prod
```

### **Backend (Railway/Render)**
1. Push code to GitHub
2. Connect Railway/Render to repository
3. Set environment variables
4. Deploy

---

## 🎨 Design System

### **Colors**
- Primary: Slate `#334155`
- Accent: Teal `#0d9488`
- Background: Warm White `#fefdfb`
- Card: Pure White `#ffffff`

### **Typography**
- Headings: System font stack
- Body: Inter or system sans-serif

---

## 📊 Database Schema Highlights

- **listings** - Property information and AI-generated content
- **offers** - Buyer offers and seller responses
- **comps** - Comparable sales for pricing analysis
- **notifications** - Real-time notification system
- **profiles** - User information and roles

See `database/schema.sql` for complete schema.

---

## 🔑 Key Features

✅ **AI-Powered Content Generation** - Marketing copy, descriptions, summaries  
✅ **Vision Analysis** - Property improvement suggestions from images  
✅ **Smart Pricing** - Comparable sales analysis and strategy  
✅ **Intelligent Matching** - Buyer-property matching algorithm  
✅ **Value Evaluation** - Fair price assessment for buyers  
✅ **Negotiation Support** - AI-powered offer strategy  
✅ **Real-time Notifications** - Instant offer updates  
✅ **Dual-Portal Architecture** - Separate seller and buyer workflows  

---

## 📝 API Documentation

Full API documentation available at:
- Development: `http://localhost:8000/docs`
- See `homeport_api_endpoints.md` for detailed specs

---

## 🤝 Contributing

This is an internship challenge project. Feedback and suggestions welcome!

---

## 📄 License

MIT License - feel free to use for learning and demo purposes.

---

## 🙏 Acknowledgments

- **Anthropic Claude** for AI capabilities
- **Supabase** for backend infrastructure
- **shadcn/ui** for beautiful components
- **Vercel** for Next.js framework

---

## 📧 Contact

For questions or demo requests, contact: [your-email]

---

**Built with ❤️ for the real estate industry**
