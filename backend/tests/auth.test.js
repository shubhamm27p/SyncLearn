import request from 'supertest';
import { jest } from '@jest/globals';

// Mock the Supabase client before importing app
jest.unstable_mockModule('../src/utils/supabase.js', () => {
    const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn(),
        maybeSingle: jest.fn(),
    };

    const supabase = {
        from: jest.fn(() => queryBuilder),
    };

    return {
        supabase,
        fetchSingleRecord: jest.fn(async (query) => {
            if (query && typeof query.maybeSingle === 'function') {
                return query.maybeSingle();
            }
            if (query && typeof query.single === 'function') {
                return query.single();
            }
            return { data: null, error: null };
        })
    };
});

const { app } = await import('../src/app.js');
const { supabase } = await import('../src/utils/supabase.js');

const mockQueryBuilder = supabase.from();

describe('API Security & Auth Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        supabase.from.mockReturnValue(mockQueryBuilder);
    });

    describe('Rate Limiting & Helmet', () => {
        it('should have security headers (Helmet) applied', async () => {
            const res = await request(app).get('/api/v1/users/non-existent');
            expect(res.headers['x-powered-by']).toBeUndefined();
            expect(res.headers['x-dns-prefetch-control']).toBe('off');
        });

        it('should return 401 on protected routes without a token', async () => {
            const res = await request(app).get('/api/v1/users/profile');
            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Unauthorized: No token provided');
        });
    });

    describe('Auth Middleware', () => {
        it('should return 401 if token is invalid', async () => {
            // Mock Supabase to return an error/no user
            mockQueryBuilder.maybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
            
            const res = await request(app)
                .get('/api/v1/users/profile')
                .set('Authorization', 'Bearer invalid-token');
            
            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Unauthorized: Invalid token');
        });

        it('should return 403 if user is inactive', async () => {
            // Mock Supabase to return an inactive user
            mockQueryBuilder.maybeSingle.mockResolvedValueOnce({ 
                data: { id: '1', username: 'testuser', is_active: false }, 
                error: null 
            });
            
            const res = await request(app)
                .get('/api/v1/users/profile')
                .set('Authorization', 'Bearer valid-inactive-token');
            
            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('Forbidden: User account is inactive');
        });

        it('should allow request if user is valid and active', async () => {
            // Mock Supabase to return an active user
            mockQueryBuilder.maybeSingle.mockResolvedValueOnce({ 
                data: { id: '1', username: 'testuser', is_active: true }, 
                error: null 
            });
            
            const res = await request(app)
                .get('/api/v1/users/profile')
                .set('Authorization', 'Bearer valid-active-token');
            
            expect(res.statusCode).toBe(200);
            expect(res.body.username).toBe('testuser');
        });
    });

    describe('Role Authorization & IDOR Protection', () => {
        it('should forbid student role from accessing admin users endpoint', async () => {
            mockQueryBuilder.maybeSingle.mockResolvedValueOnce({
                data: { id: '1', username: 'student_user', role: 'student', is_active: true },
                error: null
            });

            const res = await request(app)
                .get('/api/v1/users/admin/users')
                .set('Authorization', 'Bearer valid-student-token');

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('Forbidden: Administrator access required');
        });

        it('should reject unauthenticated request to clear user history', async () => {
            const res = await request(app)
                .delete('/api/v1/users/clear_user_history');

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Unauthorized: No token provided');
        });
    });

    describe('Google Login', () => {
        it('should create a session for emails that contain dots', async () => {
            mockQueryBuilder.maybeSingle.mockResolvedValue({ data: null, error: null });
            mockQueryBuilder.single
                .mockResolvedValueOnce({
                    data: {
                        id: 'user-1',
                        name: 'Jane Doe',
                        username: 'jane.doe@gmail.com',
                        email: 'jane.doe@gmail.com',
                        role: 'student',
                        is_active: true
                    },
                    error: null
                })
                .mockResolvedValueOnce({
                    data: {
                        id: 'user-1',
                        name: 'Jane Doe',
                        username: 'jane.doe@gmail.com',
                        email: 'jane.doe@gmail.com',
                        role: 'student',
                        is_active: true
                    },
                    error: null
                });

            const res = await request(app)
                .post('/api/v1/users/google-login')
                .send({
                    email: 'jane.doe@gmail.com',
                    name: 'Jane Doe',
                    googleId: 'user_clerk_123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.token).toBeTruthy();
            expect(res.body.user.email).toBe('jane.doe@gmail.com');
            expect(mockQueryBuilder.eq).toHaveBeenCalledWith('email', 'jane.doe@gmail.com');
        });
    });

});
