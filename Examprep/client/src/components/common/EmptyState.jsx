const EmptyState = ({ icon: Icon, title, description }) => {
  return (
    <div className="glass-panel border-dashed border-white/10 p-12 text-center">
      {Icon && <Icon className="w-10 h-10 text-gray-500 mx-auto mb-4" />}
      <p className="text-gray-400 font-medium">{title}</p>
      {description && (
        <p className="text-gray-500 text-sm mt-1">{description}</p>
      )}
    </div>
  );
};

export default EmptyState;