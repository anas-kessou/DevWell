# DevWell - Complete Setup Guide

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://anaskessou4_db_user:TouqQd0MSBI5d2om@cluster0.57ed7ik.mongodb.net/devwell
JWT_SECRET=your_jwt_secret_key_here
```

Start the backend:
```bash
npm start
```

Backend will run on http://localhost:5000

### 2. Frontend Setup

```bash
cd frontend
npm install
```

The frontend `.env` is already configured with:
```env
VITE_API_URL=http://localhost:5000/api
VITE_TM_MODEL_URL=
```

Start the frontend:
```bash
npm run dev
```

Frontend will run on http://localhost:5173

## 🤖 Teachable Machine Integration

### Creating Your Fatigue Detection Model

1. **Go to Teachable Machine**
   - Visit: https://teachablemachine.withgoogle.com/
   - Click "Get Started"
   - Select "Image Project" → "Standard image model"

2. **Create Classes**
   Create 3 classes for fatigue detection:
   - **Class 1: "Awake" or "Focused" or "Normal"**
     - Capture yourself looking alert and focused
     - Take 50-100 images
     - Vary angles and lighting
   
   - **Class 2: "Tired" or "Fatigue"**
     - Capture yourself looking tired
     - Eyes slightly closed, slouching
     - Take 50-100 images
   
   - **Class 3: "Drowsy" or "Alert" or "Very Tired"**
     - Capture yourself very tired/yawning
     - Eyes closed, head nodding
     - Take 50-100 images

3. **Train the Model**
   - Click "Train Model"
   - Wait for training to complete (2-5 minutes)
   - Test the model with your webcam

4. **Export the Model**
   - Click "Export Model"
   - Select "Upload my model"
   - Click "Upload"
   - **Copy the shareable link** that looks like:
     ```
     https://teachablemachine.withgoogle.com/models/ABC123XYZ/
     ```

5. **Add Model URL to DevWell**
   
   **Option A: Via Environment Variable**
   - Open `frontend/.env`
   - Add your model URL:
     ```env
     VITE_TM_MODEL_URL=https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/
     ```
   - Restart frontend: `npm run dev`

   **Option B: Via Dashboard Settings**
   - Open the app and login
   - Go to Dashboard
   - Click the ⚙️ settings icon on Camera Monitor
   - Paste your Teachable Machine URL
   - Click "Load Model"

## 📝 Class Name Mapping

The app maps Teachable Machine class names to fatigue levels:

| Class Name Contains | Fatigue Level | Action |
|-------------------|---------------|---------|
| "drowsy", "sleepy", "yawn" | **alert** 🔴 | High fatigue - Take break! |
| "tired", "fatigue" | **tired** 🟠 | Moderate fatigue - Rest soon |
| "awake", "focused", "normal" | **rested** 🟢 | You're doing great! |

## 🔧 API Endpoints (Backend)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Fatigue Detection
- `POST /api/fatigue/detect` - Log fatigue event
- `GET /api/fatigue/history?limit=50` - Get fatigue history

### Feedback
- `POST /api/feedback/add` - Submit feedback
- `GET /api/feedback/list?limit=10` - Get feedback list

### User Management
- `PUT /api/user/profile` - Update profile
- `DELETE /api/user/account` - Delete account

## 🧪 Testing the Integration

1. **Start Backend & Frontend**
   ```bash
   # Terminal 1
   cd backend && npm start

   # Terminal 2
   cd frontend && npm run dev
   ```

2. **Register/Login**
   - Open http://localhost:5173
   - Register a new account
   - Login to dashboard

3. **Load Teachable Machine Model**
   - Click settings ⚙️ icon on Camera Monitor
   - Paste your model URL
   - Click "Load Model"
   - Wait for success message

4. **Start Detection**
   - Click "Start Camera"
   - Grant camera permissions
   - Model will analyze your face every 3 seconds
   - View results in real-time

5. **Check Backend Logs**
   - Fatigue events are logged to MongoDB
   - View history in the Dashboard Graph

## 📦 Installed Dependencies

### Backend
- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- cors - CORS middleware
- helmet - Security headers

### Frontend
- axios - HTTP client for backend API
- @teachablemachine/image - Teachable Machine integration
- @tensorflow/tfjs - TensorFlow.js for ML
- react-router-dom - Routing
- lucide-react - Icons
- tailwindcss - Styling

## 🎯 Features

✅ **Backend Integration**
- Axios client with automatic token injection
- Error handling and 401 redirects
- Full CRUD operations for fatigue and feedback

✅ **Teachable Machine AI**
- Real-time face analysis
- Customizable model URL
- 3-second prediction intervals
- Confidence scoring

✅ **Authentication**
- JWT-based auth
- Secure password hashing
- Token management
- Protected routes

✅ **Fatigue Detection**
- AI-powered face analysis
- Automatic event logging
- Historical tracking
- Visual notifications

## 🐛 Troubleshooting

### Model not loading
- Check model URL format (should end with `/`)
- Ensure model is publicly shared
- Check browser console for errors
- Try re-exporting from Teachable Machine

### Camera not working
- Grant camera permissions in browser
- Check if camera is being used by another app
- Try different browser
- Ensure HTTPS or localhost

### Backend connection failed
- Verify backend is running on port 5000
- Check `.env` VITE_API_URL is correct
- Check browser network tab for errors
- Verify CORS is enabled

### Authentication issues
- Clear localStorage: `localStorage.clear()`
- Check JWT_SECRET matches in backend
- Verify MongoDB connection
- Check token expiration (7 days)

## 🔐 Security Notes

- Never commit `.env` files to git
- Use strong JWT_SECRET in production
- Enable HTTPS in production
- Implement rate limiting
- Validate all user inputs
- Use environment-specific configs

## 📈 Next Steps

1. Train a better Teachable Machine model with more data
2. Customize class names and mapping logic
3. Add more fatigue metrics (blink rate, posture)
4. Implement break reminders
5. Add analytics and reporting
6. Deploy to production

## 🎓 Resources

- [Teachable Machine Docs](https://teachablemachine.withgoogle.com/train)
- [TensorFlow.js Guide](https://www.tensorflow.org/js)
- [Axios Documentation](https://axios-http.com/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🆘 Support

If you encounter issues:
1. Check browser console for errors
2. Check backend terminal for errors
3. Verify all dependencies are installed
4. Ensure MongoDB is accessible
5. Test API endpoints with test.rest file

Happy coding! 🚀
