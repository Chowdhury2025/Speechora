const Header = ({ title }) => {
	return (
		<header className='bg-[#f7ffec] backdrop-blur-md shadow-sm border-b border-[#e5e5e5]'>
			<div className='max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8'>
				<h1 className='text-2xl font-bold text-[#58cc02]'>{title}</h1>
			</div>
		</header>
	);
};

export default Header;
