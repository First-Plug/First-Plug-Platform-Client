// components
export * from "./components/dashboard-layout";
export * from "./components/swapy-item";
export * from "./components/widgets";
export * from "./components/empty-dashboard-card";

export * from "./components/widgets/my-assets/assets-widget";
export * from "./components/widgets/my-assets/stock-card";
export * from "./components/widgets/my-assets/inventory-status-legend";
export * from "./components/widgets/my-assets/doughnut-chart";

export * from "./components/widgets/computer-updates/computer-updates-widget";
export * from "./components/widgets/computer-updates/computer-updates-card";
export * from "./components/widgets/computer-updates/computer-age-chart";
export * from "./components/widgets/computer-updates/progress-circle";
export * from "./components/widgets/computer-updates/computer-updates-tables";
export * from "./components/widgets/computer-updates/computer-updates-table";

export * from "./components/widgets/latest-activity-widget/latest-activity-widget";
export * from "./components/widgets/latest-activity-widget/latest-activity-table";

export * from "./components/widgets/member-by-country/member-by-country-widget";
export * from "./components/widgets/member-by-country/ops-by-country-chart";

export * from "./components/widgets/upcoming-birthdays/upcoming-birthdays-widget";
export * from "./components/widgets/upcoming-birthdays/team-home-card";
export * from "./components/widgets/upcoming-birthdays/birthday-table";

// hooks
export * from "./hooks/useSwapy";
export * from "./hooks/useSaveOrder";
export * from "./hooks/useSortedWidgets";
export * from "./hooks/useFetchDashboard";
export * from "./hooks/useProductStats";
export * from "./hooks/useAverageAge";
export * from "./hooks/useComputerAge";
export * from "./hooks/useFetchUser";

// interfaces
export * from "./interfaces/widget.interface";

// api
export * from "./api/updateDashboard";

// utils
export * from "./utils/getBarColor";
export * from "./utils/formatBirthDate";
export * from "./utils/isBirthdayToday";
