'use client';

import { Button } from '@/components/ui/button';
import { SignInButton } from '@clerk/nextjs';
import { Unauthenticated, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function Home() {
	const createFile = useMutation(api.files.createFile);
	const files = useQuery(api.files.getFiles);

	return (
		<div className='flex flex-col min-h-screen items-center justify-center'>
			<>
				<Unauthenticated>
					<SignInButton mode='modal'>
						<Button>Sign in</Button>
					</SignInButton>
				</Unauthenticated>
			</>

			{files?.map((file) => <p key={file._id}>{file.name}</p>)}

			<Button onClick={() => createFile({ name: 'test 2' })}>Click Me</Button>
		</div>
	);
}
