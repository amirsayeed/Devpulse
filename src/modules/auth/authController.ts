import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/database.js';
import { StatusCodes } from 'http-status-codes';

import type { Request, Response } from 'express';
import type { AuthRequest, JWTPayload } from '../../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// User signup
export const signup = async (req: Request<{}, {}, AuthRequest>, res: Response) => {
  try {
    const { name, email, password, role = 'contributor' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (!['contributor', 'maintainer'].includes(role)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Role must be contributor or maintainer',
      });
    }

    // Check if email already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, hashedPassword, role]
    );

    const user = result.rows[0];

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to register user',
      errors: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// User login
export const login = async (req: Request<{}, {}, AuthRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const payload: JWTPayload = {
      id: user.id,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET as string, { expiresIn: "7d" });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to login',
      errors: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};