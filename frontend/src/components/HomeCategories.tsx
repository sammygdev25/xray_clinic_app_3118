import { Section, Grid, Card, CardBody, CardTitle } from '../components/ui';
import { Icon, IconName } from '../components/icons';

interface Step {
  icon: IconName;
  title: string;
  text: string;
}

interface HomeCategoriesProps {
  steps?: Step[];
}

const defaultSteps: Step[] = [
  {
    icon: 'calendar',
    title: 'Book your exam',
    text: 'Our receptionists schedule your X-ray in the right room and confirm the date and time with you.',
  },
  {
    icon: 'image',
    title: 'Radiologist reviews',
    text: 'A radiologist examines the images and writes a clear, detailed report tied to your exam.',
  },
  {
    icon: 'credit-card',
    title: 'View results & invoice',
    text: 'Sign in anytime to see your exam status, read your report and check your invoice.',
  },
];

export default function HomeCategories({ steps = defaultSteps }: HomeCategoriesProps) {
  return (
    <Section
      eyebrow="How it works"
      title="From booking to results, in three steps"
      subtitle="A simple path for every patient, from scheduling through to the final report and invoice."
    >
      <Grid size="sm">
        {steps.map((step) => (
          <Card key={step.title}>
            <CardBody>
              <Icon name={step.icon} size={28} />
              <CardTitle>{step.title}</CardTitle>
              <p className="ds-muted">{step.text}</p>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}