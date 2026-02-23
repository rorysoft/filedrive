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
import { useConvex, useMutation } from 'convex/react';
import {
	FileTextIcon,
	GanttChartIcon,
	ImageIcon,
	MoreVertical,
	TrashIcon,
} from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
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

function ImagePreview({
	storageId,
	name,
}: {
	storageId: Doc<'files'>['fileId'];
	name: string;
}) {
	const convex = useConvex();
	const [signedUrl, setSignedUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		async function fetchPreview() {
			setIsLoading(true);
			setError(null);
			try {
				const url = await convex.query(api.getImages.getImageUrl, {
					storageId,
				});

				if (!cancelled) {
					setSignedUrl(url);
				}
			} catch (err) {
				console.error('Unable to load image preview', err);
				if (!cancelled) {
					setError('Unable to load preview');
					setSignedUrl(null);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		fetchPreview();

		return () => {
			cancelled = true;
		};
	}, [convex, storageId]);

	if (isLoading) {
		return (
			<div className='flex h-[200px] w-full items-center justify-center rounded-md border text-sm text-muted-foreground'>
				Loading preview...
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex h-[200px] w-full items-center justify-center rounded-md border border-destructive/40 bg-destructive/10 text-sm text-destructive'>
				{error}
			</div>
		);
	}

	if (!signedUrl) {
		return null;
	}

	return (
		<img
			src={signedUrl}
			alt={`${name} preview`}
			className='h-[200px] w-full rounded-md border object-cover'
			loading='lazy'
		/>
	);
}

export default function FileCard({ file }: { file: Doc<'files'> }) {
	const typeIcons = {
		image: <ImageIcon />,
		pdf: <FileTextIcon />,
		csv: <GanttChartIcon />,
	} as Record<Doc<'files'>['type'], ReactNode>;

	return (
		<Card className='min-w-[180px]'>
			<CardHeader className='relative'>
				<CardTitle className='flex gap-2'>
					<div className=''>{typeIcons[file.type]}</div>
					{file.name}
				</CardTitle>
				<div className='absolute top-2 right-2'>
					<FileCardActions file={file} />
				</div>
				{/* <CardDescription>Card Description</CardDescription> */}
			</CardHeader>
			<CardContent className=''>
				{file.type === 'image' && (
					<ImagePreview
						storageId={file.fileId}
						name={file.name}
					/>
				)}
			</CardContent>
			<CardFooter>
				<Button>Download</Button>
			</CardFooter>
		</Card>
	);
}
