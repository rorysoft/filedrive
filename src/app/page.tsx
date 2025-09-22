'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SignInButton, useOrganization, useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { Unauthenticated, useMutation, useQuery } from 'convex/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { api } from '../../convex/_generated/api';

const formSchema = z.object({
	title: z.string().min(1).max(200),
	file: z
		.custom<FileList>((val) => val instanceof FileList, 'Required')
		.refine((files) => files.length > 0, 'Required'),
});

export default function Home() {
	const { organization } = useOrganization();
	const user = useUser();
	const generateUploadUrl = useMutation(api.files.generateUploadUrl);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: '',
		},
	});

	const fileRef = form.register('file');
	const currentOrg = organization?.id ? organization.id : user.user?.id;

	async function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
		console.log(values.file);
		if (!currentOrg) return;
		const postUrl = await generateUploadUrl();

		const result = await fetch(postUrl, {
			method: 'POST',
			headers: { 'Content-Type': values.file[0].type },
			body: values.file[0],
		});

		const { storageId } = await result.json();
		try {
			await createFile({
				name: values.title,
				orgId: currentOrg,
				fileId: storageId,
			});
			form.reset();

			setIsFileDialogOpen(false);
			toast.success('File uploaded successfully');
		} catch (err) {
			console.log(err);
			toast.error('Error uploading file');
		}
	}

	const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

	const createFile = useMutation(api.files.createFile);
	const files = useQuery(api.files.getFiles, {
		orgId: currentOrg ? currentOrg : 'skip',
	});

	console.log('Org:', organization?.id, 'USERID', user.user?.id);

	return (
		<main className='container mx-auto pt-12'>
			<div className='flex justify-between items-center'>
				<h1 className='text-4xl font-bold'>Your files</h1>
				<Dialog
					open={isFileDialogOpen}
					onOpenChange={(isOpen) => {
						setIsFileDialogOpen(isOpen);
						form.reset();
					}}
				>
					<DialogTrigger asChild>
						<Button onClick={() => {}}>Upload File</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle className='mb-8'>Upload your file</DialogTitle>
							<DialogDescription>
								<Form {...form}>
									<form
										onSubmit={form.handleSubmit(onSubmit)}
										className='space-y-8'
									>
										<FormField
											control={form.control}
											name='title'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Title</FormLabel>
													<FormControl>
														<Input
															placeholder='Enter a title'
															{...field}
														/>
													</FormControl>

													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name='file'
											render={() => (
												<FormItem>
													<FormLabel>File</FormLabel>
													<FormControl>
														<Input
															type='file'
															{...fileRef}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<Button
											type='submit'
											disabled={form.formState.isSubmitting}
											className='flex gap-1'
										>
											{form.formState.isSubmitting && (
												<Loader2 className='animate-spin h-4 w-4' />
											)}
											Submit
										</Button>
									</form>
								</Form>
							</DialogDescription>
						</DialogHeader>
					</DialogContent>
				</Dialog>
			</div>
			<>
				<Unauthenticated>
					<SignInButton mode='modal'>
						<Button>Sign in</Button>
					</SignInButton>
				</Unauthenticated>
			</>

			{files?.map((file) => <p key={file._id}>{file.name}</p>)}
		</main>
	);
}
