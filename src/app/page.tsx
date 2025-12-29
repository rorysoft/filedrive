'use client';

import { Button } from '@/components/ui/button';
import { SignInButton, useOrganization, useUser } from '@clerk/nextjs';
import { Unauthenticated, useQuery } from 'convex/react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { api } from '../../convex/_generated/api';
import FileCard from './file-card';
import { UploadButton } from './upload-button';

export default function Home() {
	const { organization } = useOrganization();
	const user = useUser();

	const currentOrg = organization?.id ? organization.id : user.user?.id;

	const files = useQuery(api.files.getFiles, {
		orgId: currentOrg ? currentOrg : 'skip',
	});

	const isLoading = files === undefined;

	console.log('Org:', organization?.id, 'USERID', user.user?.id);

	return (
		<main className='container mx-auto pt-12'>
			{isLoading && (
				<div className='flex flex-col gap-8 w-full items-center mt-24 text-gray-500'>
					<Loader2 className='h-24 w-24 animate-spin' />
					<div className='text-2xl'>Loading</div>
				</div>
			)}
			<>
				<Unauthenticated>
					<SignInButton mode='modal'>
						<Button>Sign in</Button>
					</SignInButton>
				</Unauthenticated>
			</>
			{files && files?.length === 0 && (
				<div className='flex flex-col gap-8 w-full items-center mt-24'>
					<Image
						alt='image of an empty folder'
						width={300}
						height={300}
						src='./empty.svg'
					/>
					<div className='text-2xl'>You have no files upload one!</div>
					<UploadButton />
				</div>
			)}
			{files && files.length > 0 && (
				<>
					<div className='flex justify-between items-center mb-8'>
						<h1 className='text-4xl font-bold'>Your Files</h1>

						<UploadButton />
					</div>

					<div className='grid grid-cols-4 gap-4'>
						{files.map((file) => {
							return (
								<FileCard
									key={file._id}
									file={file}
								/>
							);
						})}
					</div>
				</>
			)}
		</main>
	);
}
