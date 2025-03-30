

interface MenuItem {
    id: number;
    name: string;
    icon: string;
}

const GetMenuItems = () => {
    const menuItems: MenuItem[] = [
        { id: 1, name: 'Dashboard', icon: 'dashboard' },
        { id: 2, name: 'Profile', icon: 'person' },
        { id: 3, name: 'Settings', icon: 'settings' },
        { id: 4, name: 'Help', icon: 'help' },
    ];

    return menuItems;

}

export default GetMenuItems;