import DonationForm from "../components/DonationForm";
import Navbar from "../components/Navbar";

export default function DonationPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex justify-center py-10">
        <DonationForm />
      </div>
    </div>
  );
}




