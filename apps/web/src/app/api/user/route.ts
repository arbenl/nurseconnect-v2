import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { zodToFieldErrors } from '@nurseconnect-v2/ui/lib/utils';
import { UserProfile } from '@nurseconnect-v2/contracts';
import { auth } from '@/lib/firebase/admin';

const GetUserSchema = z.object({
  id: z.string().uuid(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = Object.fromEntries(searchParams.entries());

  try {
    const { id } = GetUserSchema.parse(query);
    const userRecord = await auth.getUser(id);
    const user: UserProfile = {
      uid: userRecord.uid,
      email: userRecord.email || '',
      displayName: userRecord.displayName || '',
      roles: (userRecord.customClaims?.roles as ('admin' | 'nurse' | 'staff')[]) || ['staff'],
      createdAt: userRecord.metadata.creationTime,
      updatedAt: userRecord.metadata.lastSignInTime,
    };
    return NextResponse.json(UserProfile.parse(user));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: zodToFieldErrors(error) }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}