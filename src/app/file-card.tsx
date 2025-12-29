import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMutation } from 'convex/react';
import { MoreVertical, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../convex/_generated/api';
import { Doc } from '../../convex/_generated/dataModel';

function FileCardActions({ file }: { file: Doc<'files'> }) {
	const deleteFile = useMutation(api.files.deleteFile);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);

	return (
		<>
			<AlertDialog
				open={isConfirmOpen}
				onOpenChange={setIsConfirmOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete your
							file.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={async () => {
								await deleteFile({ fileId: file._id });
								toast.success('File deleted successfully');
							}}
						>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<DropdownMenu>
				<DropdownMenuTrigger className='hover:cursor-pointer '>
					<MoreVertical />
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem
						onClick={() => setIsConfirmOpen(true)}
						className='flex gap-1 text-red-600 items-center hover:cursor-pointer hover:text-red-600'
					>
						<TrashIcon className='w-4 h-4 text-red-600' />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}

export default function FileCard({ file }: { file: Doc<'files'> }) {
	return (
		<Card className='min-w-[180px]'>
			<CardHeader className='relative'>
				<CardTitle>{file.name}</CardTitle>
				<div className='absolute top-2 right-2'>
					<FileCardActions file={file} />
				</div>
				{/* <CardDescription>Card Description</CardDescription> */}
			</CardHeader>
			<CardContent>
				<p>Card Content</p>
			</CardContent>
			<CardFooter>
				<Button>Download</Button>
			</CardFooter>
		</Card>
	);
}
