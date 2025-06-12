const Header = ({ title }) => {
	return (
		<header className='bg-sky_blue-400 bg-opacity-10 backdrop-blur-md shadow-sm border-b border-azure-300'>
			<div className='max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8'>
				<h1 className='text-2xl font-semibold text-sky_blue-800'>{title}</h1>
			</div>
		</header>
	);
};
export default Header;
