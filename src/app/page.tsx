'use client';

import { Button } from '@/components/ui/button';
import { SignInButton, useAuth, useOrganization } from '@clerk/nextjs';
import { Unauthenticated, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function Home() {
	const { organization } = useOrganization();
	const { userId, isSignedIn } = useAuth();
	const currentOrg = organization?.id ? organization.id : userId!;
	const createFile = useMutation(api.files.createFile);
	const files = useQuery(api.files.getFiles, {
		orgId: currentOrg ? currentOrg : 'skip',
	});

	console.log('Org:', organization?.id);
	console.log();

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
			{isSignedIn && (
				<Button
					onClick={() =>
						createFile({ name: 'test 2', orgId: organization?.id || userId! })
					}
				>
					Click Me
				</Button>
			)}
		</div>
	);
}
