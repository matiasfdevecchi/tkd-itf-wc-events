import EventTable from './components/EventTable';
import { Event } from './types';
import { promises as fs } from 'fs';
import path from 'path';

async function getEvents(): Promise<Event[]> {
  const filePath = path.join(process.cwd(), 'public', 'output.csv');
  const fileContent = await fs.readFile(filePath, 'utf-8');

  const lines = fileContent.trim().split('\n');
  const headers = lines[0].split(',');

  const events: Event[] = lines.slice(1).map((line) => {
    const values = line.split(',');
    return {
      Type: values[0] || '',
      CategoryId: values[1] || '',
      CategoryDescription: values[2] || '',
      StartDate: values[3] || '',
      EndDate: values[4] || '',
      Ring: values[5] || '',
      Link: values[6] || '',
    };
  });

  return events;
}

export default async function Home() {
  const events = await getEvents();

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight">
            TKD ITF WC
          </h1>
          <p className="text-neutral-400 text-lg">
            Explora, filtra y ordena eventos del campeonato mundial
          </p>
        </header>

        <main className="bg-neutral-950 rounded-lg shadow-2xl p-6 border border-neutral-800">
          <EventTable events={events} />
        </main>
      </div>
    </div>
  );
}
