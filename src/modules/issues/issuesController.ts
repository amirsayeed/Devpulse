
import type { Request, Response } from 'express';
import pool from '../../config/database.js';
import { StatusCodes } from 'http-status-codes';

// Get all issues with sorting and filtering
export const getAllIssues = async (req: Request, res: Response) => {
  try {
    const { sort = 'newest', type, status } = req.query;

    let query = 'SELECT * FROM issues WHERE 1=1';
    const params: (string | number)[] = [];

    // Filter by type
    if (type) {
      query += ' AND type = $' + (params.length + 1);
      params.push(type as string);
    }

    // Filter by status
    if (status) {
      query += ' AND status = $' + (params.length + 1);
      params.push(status as string);
    }

    // Sorting
    if (sort === 'oldest') {
      query += ' ORDER BY created_at ASC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const result = await pool.query(query, params);
    const issues = result.rows;

    // Fetch reporter details for each issue
    const issuesWithReporter = await Promise.all(
      issues.map(async (issue) => {
        const reporterResult = await pool.query(
          'SELECT id, name, role FROM users WHERE id = $1',
          [issue.reporter_id]
        );
        return {
          ...issue,
          reporter: reporterResult.rows[0] || null,
        };
      })
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Issues retrieved successfully',
      data: issuesWithReporter.map(issue => {
        const { reporter_id, ...issueData } = issue;
        return issueData;
      }),
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve issues',
      errors: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get single issue by ID
export const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
    const issue = result.rows[0];

    if (!issue) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Fetch reporter details
    const reporterResult = await pool.query(
      'SELECT id, name, role FROM users WHERE id = $1',
      [issue.reporter_id]
    );

    const { reporter_id, ...issueData } = {
        ...issue,
        reporter: reporterResult.rows[0] || null,
    };

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Issue retrieved successfully',
      data: issueData,
    });
  } catch (error) {
    console.error('Get single issue error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve issue',
      errors: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Create a new issue
export const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body;

    // Validation
    if (!title || !description || !type) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Title, description, and type are required',
      });
    }

    if (title.length > 150) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Title must be 150 characters or less',
      });
    }

    if (description.length < 20) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Description must be at least 20 characters',
      });
    }

    if (!['bug', 'feature_request'].includes(type)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Type must be bug or feature_request',
      });
    }

    // Get reporter_id from authenticated user
    const reporter_id = req.user?.id;

    if (!reporter_id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const result = await pool.query(
      `INSERT INTO issues (title, description, type, status, reporter_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [title, description, type, 'open', reporter_id]
    );

    const newIssue = result.rows[0];

    // Fetch reporter details
    const reporterResult = await pool.query(
      'SELECT id, name, role FROM users WHERE id = $1',
      [newIssue.reporter_id]
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Issue created successfully',
      data: {
        ...newIssue,
        reporter: reporterResult.rows[0] || null,
      },
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create issue',
      errors: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update issue
export const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, type, status } = req.body;

    // Get issue
    const issueResult = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
    const issue = issueResult.rows[0];

    if (!issue) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Check permissions
    const isMaintainer = req.user?.role === 'maintainer';
    const isOwner = req.user?.id === issue.reporter_id;
    const isOpenStatus = issue.status === 'open';

    if (!isMaintainer && (!isOwner || !isOpenStatus)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You can only update your own open issues',
      });
    }

    // Validation
    if (title && title.length > 150) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Title must be 150 characters or less',
      });
    }

    if (description && description.length < 20) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Description must be at least 20 characters',
      });
    }

    if (type && !['bug', 'feature_request'].includes(type)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Type must be bug or feature_request',
      });
    }

    if (status && !['open', 'in_progress', 'resolved'].includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Status must be open, in_progress, or resolved',
      });
    }

    // Update
    const result = await pool.query(
      `UPDATE issues 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           type = COALESCE($3, type),
           status = COALESCE($4, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [title || null, description || null, type || null, status || null, id]
    );

    const updatedIssue = result.rows[0];

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Issue updated successfully',
      data: updatedIssue,
    });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update issue',
      errors: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete issue
export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get issue
    const issueResult = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
    const issue = issueResult.rows[0];

    if (!issue) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Only maintainers can delete
    if (req.user?.role !== 'maintainer') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Only maintainers can delete issues',
      });
    }

    // Delete
    await pool.query('DELETE FROM issues WHERE id = $1', [id]);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete issue',
      errors: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};