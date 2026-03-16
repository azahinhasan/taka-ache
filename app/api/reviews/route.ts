import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import ATMReview from '@/app/models/ATMReview';
import { handleCors, getCorsHeaders } from '@/app/lib/cors';

// GET: Fetch reviews for a specific ATM
export async function GET(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const { searchParams } = new URL(request.url);
    const atmId = searchParams.get('atmId');

    if (!atmId) {
      return NextResponse.json(
        { error: 'ATM ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    await connectDB();

    const reviews = await ATMReview.find({ atmId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Calculate average rating and stats
    const stats = {
      totalReviews: reviews.length,
      averageRating: 0,
      cashAvailableCount: 0,
      workingCount: 0,
      notWorkingCount: 0,
      partiallyWorkingCount: 0,
    };

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      stats.averageRating = parseFloat((totalRating / reviews.length).toFixed(1));
      stats.cashAvailableCount = reviews.filter(r => r.cashAvailable).length;
      stats.workingCount = reviews.filter(r => r.workingStatus === 'working').length;
      stats.notWorkingCount = reviews.filter(r => r.workingStatus === 'not_working').length;
      stats.partiallyWorkingCount = reviews.filter(r => r.workingStatus === 'partially_working').length;
    }

    return NextResponse.json({
      success: true,
      reviews,
      stats,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST: Create a new review for an ATM
export async function POST(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const body = await request.json();
    const { atmId, userName, rating, comment, cashAvailable, workingStatus } = body;

    // Validation
    if (!atmId || !userName || !comment || cashAvailable === undefined || !workingStatus) {
      return NextResponse.json(
        { error: 'Required fields: atmId, userName, comment, cashAvailable, workingStatus' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!['working', 'not_working', 'partially_working'].includes(workingStatus)) {
      return NextResponse.json(
        { error: 'Invalid working status. Must be: working, not_working, or partially_working' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (comment.length > 500) {
      return NextResponse.json(
        { error: 'Comment must be 500 characters or less' },
        { status: 400, headers: corsHeaders }
      );
    }

    await connectDB();

    const review = await ATMReview.create({
      atmId,
      userName: userName.trim(),
      rating,
      comment: comment.trim(),
      cashAvailable,
      workingStatus,
    });

    return NextResponse.json({
      success: true,
      message: 'Review posted successfully',
      review,
    }, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request);
}
