

export interface menu {
    header?: string;
    title?: string;
    icon?: any;
    to?: string;
    chip?: string;
    chipBgColor?: string;
    chipColor?: string;
    chipVariant?: string;
    chipIcon?: string;
    children?: menu[];
    disabled?: boolean;
    type?: string;
    subCaption?: string;
}

const sidebarItem: menu[] = [
    { header: 'Analyse' },
    {
        title: 'Kommunedata',
        icon: 'card-search-line-duotone',
        to: '/dashboards/kommunedata'
    },
    {
        title: 'Trends',
        icon: 'chart-line-up-linear',
        to: '/dashboards/trends'
    },
    {
        title: 'Network Graph',
        icon: 'atom-line-duotone',
        to: '/apps/graph'
    }
];

export default sidebarItem;
