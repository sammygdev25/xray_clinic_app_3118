import { Section, Split, Card, CardBody, CardTitle } from '../components/ui';
import { Icon, IconName } from '../components/icons';

interface ValuePoint {
  icon: IconName;
  title: string;
  text: string;
}

interface HomeAboutProps {
  eyebrow?: string;
  title?: string;
  story?: string[];
  values?: ValuePoint[];
}

const defaultStory = [
  'Riverside Radiology has been reading films for this community for over a decade. Our receptionists schedule every exam with care, our radiologists write clear, accurate reports, and our patients can check on their own results and invoices whenever they need to.',
  'We built this portal so that scheduling an X-ray, chest CT or ultrasound is simple, and so that every patient has a private place to see their exam status, read their report once it is ready, and settle their invoice online.',
];

const defaultValues: ValuePoint[] = [
  {
    icon: 'clock',
    title: 'Fast turnaround',
    text: 'Most reports are reviewed and signed off by a radiologist within 24 hours of the exam.',
  },
  {
    icon: 'shield',
    title: 'Private by design',
    text: 'Patients see only their own exams, reports and invoices — nothing else is ever exposed.',
  },
  {
    icon: 'users',
    title: 'Staff built-in',
    text: 'Receptionists manage rooms and schedules, radiologists write reports, all in one place.',
  },
];

export default function HomeAbout({
  eyebrow = 'About the clinic',
  title = 'Imaging care you can track from booking to report',
  story = defaultStory,
  values = defaultValues,
}: HomeAboutProps) {
  return (
    <Section eyebrow={eyebrow} title={title}>
      <Split>
        <div className="ds-stack">
          {story.map((paragraph, idx) => (
            <p key={idx} className="ds-lead">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="ds-stack">
          {values.map((value) => (
            <Card key={value.title}>
              <CardBody>
                <Icon name={value.icon} size={24} />
                <CardTitle>{value.title}</CardTitle>
                <p className="ds-muted">{value.text}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </Split>
    </Section>
  );
}