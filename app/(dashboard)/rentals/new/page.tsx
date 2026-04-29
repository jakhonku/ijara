import { getCustomers } from "@/app/actions/customers";
import { getInventory } from "@/app/actions/inventory";
import { NewRentalForm } from "@/components/rentals/new-rental-form";

export default function NewRentalPage() {
  // We'll fetch data in a server component
  // But wait, the NewRentalForm is a client component
  // So we fetch here and pass as props
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Yangi ijara</h1>
        <p className="text-muted-foreground">Yangi ijara shartnomasini rasmiylashtirish.</p>
      </div>

      <RentalFormWrapper />
    </div>
  );
}

async function RentalFormWrapper() {
  const [customers, inventory] = await Promise.all([
    getCustomers(),
    getInventory(),
  ]);

  return <NewRentalForm customers={customers} inventory={inventory} />;
}
