import { PunktacjaTypNabozenstwa, punktacje } from "@/lib/database/scheme";
import { db } from "@/lib/database";
import { PunktacjaTable } from "./puinktacja-table";
import { between, desc } from "drizzle-orm";
import { fixDate } from "@/lib/utils";

function createDateFromString(dateString: string) {
  // Split the string into month and year
  const [month, year] = dateString.split(".").map(Number);

  // Create a new Date object. Note: Months are 0-indexed in JavaScript (0 = January, 11 = December)
  return fixDate(new Date(year, month - 1)); // month - 1 because months are 0-indexed
}

async function getData(miesiac: string) {
  const firstDayOfMonth = createDateFromString(
    miesiac || `${new Date().getMonth() + 1}.${new Date().getFullYear()}`
  );
  const lastDayOfMonth = fixDate(
    new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth() + 1, 0)
  );

  console.log(firstDayOfMonth, lastDayOfMonth);

  const users = await db.query.users.findMany({ with: { punktacje: true } });

  users.forEach(async (user) => {
    const punktacja = user.punktacje.find(
      (p) =>
        p.miesiac.getMonth() === new Date().getMonth() &&
        p.miesiac.getFullYear() === new Date().getFullYear()
    );

    if (!punktacja) {
      await db.insert(punktacje).values({
        miesiac: new Date(),
        userId: user.id,
        typNabozenstwa: PunktacjaTypNabozenstwa.DEFAULT,
      });
    }
  });

  const allPunktacje = await db.query.punktacje.findMany({
    with: { user: true },
    orderBy: desc(punktacje.userId),
    where: between(punktacje.miesiac, firstDayOfMonth, lastDayOfMonth),
  });
  return allPunktacje;
}

export type PunktacjaData = Awaited<ReturnType<typeof getData>>;

export default async function punktacjaPage({
  searchParams,
}: {
  searchParams: { miesiac: string };
}) {
  const data = await getData(searchParams.miesiac);
  return (
    <div id="alles">
      <h1 className="flex justify-center items-center text-3xl mb-2 font-bold italic">
        PRZYZNAJ PUNKTY
      </h1>
      <div className="container mx-auto py-10">
        <PunktacjaTable data={data} />
      </div>
    </div>
  );
}
