import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';

export function Header() {
	return (
		<div className='border-b py-4 bg-gray-50'>
			<div className='items-center container mx-auto justify-between flex'>
				<div className=''>FILE DRIVE</div>
				<div className=''>
					<OrganizationSwitcher />
				</div>
				<UserButton />
			</div>
		</div>
	);
}
