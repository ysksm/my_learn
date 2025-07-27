
const menuItems = [
    { name: 'Menu1' },
    { name: 'Menu2' },
    { name: 'Menu3' },
    { name: 'Menu4' },
    { name: 'Menu5' },
];

export const MainPanel = () => {
    return (
        <>
            <div>
            {menuItems.map((item, index) => (
                <div key={index} className="menu-item">
                    {item.name}
                </div>
            ))}
            </div>

        <div className="main-panel">
            <h1>Main Panel</h1>
            <p>This is the main content area.</p>
        </div>
        </>

    );
}