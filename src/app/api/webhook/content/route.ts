import { NextResponse, type NextRequest } from 'next/server';
import { updateDailyContentViaWebhook } from '@/lib/dataService';
import type { LearningMaterial, Quiz } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Basic validation: expecting a date and either material or quiz data
    if (!body.date || (!body.material && !body.quiz)) {
      return NextResponse.json({ error: 'Invalid payload. "date" and either "material" or "quiz" are required.' }, { status: 400 });
    }

    const { date, material, quiz } = body as { date: string; material?: Partial<LearningMaterial>; quiz?: Partial<Quiz> };

    // Call the mock data service function
    // In a real app, this would interact with a database or a more persistent store
    const success = await updateDailyContentViaWebhook({ date, material, quiz });

    if (success) {
      return NextResponse.json({ message: 'Content updated successfully via webhook.', date: date }, { status: 200 });
    } else {
      // This path might not be reached if updateDailyContentViaWebhook always returns true or throws.
      // Adjust based on actual implementation of dataService.
      return NextResponse.json({ message: 'Webhook received, but no specific content was updated (or no change detected).', date: date }, { status: 200 });
    }

  } catch (error) {
    console.error('Webhook processing error:', error);
    if (error instanceof SyntaxError) { // JSON parsing error
        return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error during webhook processing.' }, { status: 500 });
  }
}

// Optional: GET handler for testing or providing info about the webhook
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'This is the StudyQuest content webhook endpoint. Use POST to update content.',
    expectedPayload: {
      date: "YYYY-MM-DD",
      material: {
        title: "Optional: New Title",
        content: "Optional: New Content"
        // ... other LearningMaterial fields
      },
      quiz: {
        title: "Optional: New Quiz Title",
        questions: [/* Array of QuizQuestion objects */]
        // ... other Quiz fields
      }
    } 
  }, { status: 200 });
}
