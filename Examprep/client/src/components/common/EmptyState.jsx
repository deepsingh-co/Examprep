const EmptyState = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-dark-800 border border-dashed border-white/10 rounded-xl p-12 text-center">
      {Icon && <Icon className="w-10 h-10 text-gray-600 mx-auto mb-4" />}
      <p className="text-gray-400 font-medium">{title}</p>
      {description && (
        <p className="text-gray-500 text-sm mt-1">{description}</p>
      )}
    </div>
  );
};

export default EmptyState;