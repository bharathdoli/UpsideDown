# Campus Right Side Up

A comprehensive campus platform that connects students, alumni, and the entire campus community. Built with React, TypeScript, Vite, and Supabase.

## Features

### Core Features
- **Notes & Papers**: Share and access study materials, notes, and past papers
- **Events & Hackathons**: Never miss campus events, workshops, and hackathons
- **Issue Reporter**: Report campus issues and track their resolution
- **Marketplace**: Buy, sell, or rent items within your campus community
- **Alumni Connect**: Connect with alumni for guidance and opportunities
- **Study Buddy**: Find study partners or offer help in subjects you excel at
- **Lost & Found**: Report lost items or claim found items on campus
- **YouTube Tutorials**: Browse and share YouTube tutorials for your subjects

### Advanced Features
- **Saved Items**: Bookmark your favorite notes, events, listings, and more
- **In-App Notifications**: Real-time notifications for important updates
- **Notes Ratings & Comments**: Like and comment on notes
- **Event RSVP**: RSVP to events and see who's going
- **Marketplace Chat**: Real-time chat with buyers/sellers
- **Study Groups**: Create and join study groups with cross-college collaboration
- **Group Chat**: Real-time group chat with file sharing
- **Alumni Mentorship**: Request mentorship from alumni
- **Gamification**: Earn points, badges, and climb the leaderboard
- **College-wise Filtering**: Filter content by college or view all colleges

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL, Authentication, Storage, Realtime)
- **State Management**: React Context API
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier available)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd campus-right-side-up
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Run database migrations:**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Push migrations
   supabase db push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to `http://localhost:5173`

## Project Structure

```
campus-right-side-up/
├── public/                 # Static assets
│   ├── favicon.svg        # App favicon
│   └── robots.txt         # SEO robots file
├── src/
│   ├── components/        # React components
│   │   ├── landing/       # Landing page sections
│   │   ├── layout/       # Layout components (Navbar, Footer)
│   │   └── ui/           # shadcn/ui components
│   ├── contexts/          # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # External service integrations
│   │   └── supabase/     # Supabase client and types
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components
│   └── main.tsx           # App entry point
├── supabase/
│   └── migrations/        # Database migration files
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── package.json           # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Database Schema

The application uses Supabase PostgreSQL with the following main tables:
- `profiles` - User profiles
- `notes` - Study notes and papers
- `events` - Campus events
- `marketplace_listings` - Marketplace items
- `study_buddy_requests` - Study buddy requests
- `study_groups` - Study groups
- `alumni` - Alumni profiles
- `issues` - Campus issues
- `saved_items` - User saved items
- `notifications` - In-app notifications
- `lost_and_found` - Lost and found items
- `youtube_tutorials` - YouTube tutorial links

See `supabase/migrations/` for complete schema.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

**Frontend (Vercel):**
1. Push code to GitHub
2. Import project on Vercel
3. Add environment variables
4. Deploy

**Backend (Supabase):**
- Already hosted on Supabase cloud
- Run migrations via Supabase CLI or Dashboard

## Environment Variables

Required environment variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [DEPLOYMENT.md](./DEPLOYMENT.md) guide

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)
