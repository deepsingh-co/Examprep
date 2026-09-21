const StatCard = ({ icon: Icon, label, value, color = "text-primary", bg = "bg-primary/10" }) => {
  return (
    <div className="glass-card p-5 flex items-center gap-4 relative overflow-hidden group">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_currentColor]`} style={{ color: "var(--tw-text-opacity)" }}>
        <Icon className={color} size={24} />
      </div>
      <div className="relative z-10">
        <p className="text-2xl font-bold leading-tight text-white drop-shadow-md">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;