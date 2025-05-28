'use client';

import { Button } from '@/components/ui/button';
import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignOutButton,
	useOrganization,
	useUser,
} from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function Home() {
	const organization = useOrganization();
	const user = useUser();

	let orgId: string | undefined = undefined;
	if (organization.isLoaded && user.isLoaded) {
		orgId = organization.organization?.id ?? user.user?.id;
	}

	const createFile = useMutation(api.files.createFile);
	const files = useQuery(api.files.getFiles, orgId ? { orgId } : 'skip');

	const deleteFile = useMutation(api.files.deleteFile);

	return (
		<main className='flex min-h-screen flex-col items-center justify-between p-24'>
			<SignedIn>
				<SignOutButton>
					<Button>Sign Out</Button>
				</SignOutButton>
			</SignedIn>
			<SignedOut>
				<SignInButton mode='modal'>
					<Button>Sign In</Button>
				</SignInButton>
			</SignedOut>

			{files?.map((file) => {
				return (
					<div
						className='flex justify-between items-center gap-2'
						key={file._id}
					>
						<div className=''>{file.name}</div>
						<Button
							onClick={() => deleteFile({ id: file._id })}
							className='cursor-pointer'
						>
							X
						</Button>
					</div>
				);
			})}

			<Button
				className='cursor-pointer'
				onClick={() => {
					if (!orgId) return;
					createFile({
						name: 'test',
						orgId,
					});
				}}
			>
				Create File
			</Button>
		</main>
	);
}
