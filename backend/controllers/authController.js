const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'disaster_secret_key_2024', {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

const authController = {
    // @desc    Register new user
    // @route   POST /api/auth/register
    register: async (req, res) => {
        try {
            const { username, email, password, fullName, role } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                return res.status(400).json({
                    error: 'User with this email or username already exists'
                });
            }

            // Create user
            const user = await User.create({
                username,
                email,
                password,
                fullName,
                role: role || 'user'
            });

            // Generate token
            const token = generateToken(user._id);

            res.status(201).json({
                success: true,
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    },

    // @desc    Login user
    // @route   POST /api/auth/login
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            // Validate input
            if (!username || !password) {
                return res.status(400).json({
                    error: 'Please provide username and password'
                });
            }

            // Check for user (include password for comparison)
            const user = await User.findOne({
                $or: [{ username }, { email: username }]
            }).select('+password');

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Check if user is active
            if (!user.isActive) {
                return res.status(401).json({ error: 'Account is deactivated' });
            }

            // Check password
            const isMatch = await user.matchPassword(password);

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate token
            const token = generateToken(user._id);

            res.json({
                success: true,
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    },

    // @desc    Get current logged in user
    // @route   GET /api/auth/me
    getMe: async (req, res) => {
        try {
            const user = await User.findById(req.user.id);

            res.json({
                success: true,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Get me error:', error);
            res.status(500).json({ error: 'Failed to get user info' });
        }
    },

    // @desc    Get all users (admin only)
    // @route   GET /api/auth/users
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find().select('-password');
            res.json(users);
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({ error: 'Failed to get users' });
        }
    },

    // @desc    Verify user for password reset
    // @route   POST /api/auth/verify-user
    verifyUser: async (req, res) => {
        try {
            const { username, email } = req.body;

            const user = await User.findOne({ username, email });

            if (!user) {
                return res.status(404).json({ error: 'User not found with these credentials' });
            }

            res.json({ success: true, message: 'User verified' });
        } catch (error) {
            console.error('Verify user error:', error);
            res.status(500).json({ error: 'Verification failed' });
        }
    },

    // @desc    Reset password
    // @route   POST /api/auth/reset-password
    resetPassword: async (req, res) => {
        try {
            const { username, email, newPassword } = req.body;

            const user = await User.findOne({ username, email });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Update password (will be hashed by pre-save hook)
            user.password = newPassword;
            await user.save();

            res.json({ success: true, message: 'Password reset successful' });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ error: 'Password reset failed' });
        }
    }
};

module.exports = authController;
