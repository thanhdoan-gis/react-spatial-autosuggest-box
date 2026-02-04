interface DropdownItemProps {
  label: string;
  onClick?: () => void;
}

export const DropdownItem = ({ label, onClick }: DropdownItemProps) => {
  return (
    <div onClick={onClick} className="cursor-pointer p-2 hover:bg-gray-200 hover:text-black">
      {label}
    </div>
  );
};