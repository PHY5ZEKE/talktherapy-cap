import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Typography,
} from "@mui/material";
import { ExpandMoreRounded } from "@mui/icons-material";

const FaqList = [
  {
    id: 1,
    question: "What is the process for booking an appointment?",
    answer: [
      "Ensure your referral file is ready.",
      "Navigate to the 'Book Schedule' page.",
      "Fill out the required information.",
      "Upload your referral file and click 'Submit'.",
      "Your request will be marked as pending and will require approval by an administrator.",
    ],
  },
  {
    id: 2,
    question: "Can I reschedule my appointments if I am unavailable?",
    answer:
      "Yes, appointments can be rescheduled based on clinician availability. However, rescheduling requires administrator approval. If rescheduling is denied, the appointment will revert to its original time.",
  },
  {
    id: 3,
    question: "Can I change the schedule of my appointments?",
    answer:
      "Yes, appointment schedules can be adjusted based on clinician availability. However, changes require administrator approval. If the change is denied, the appointment will revert to its original time.",
  },
  {
    id: 4,
    question: "Why is my appointment pending?",
    answer:
      "Appointments are marked as Pending because they require review and approval by an administrator to ensure: The referral file you submitted is valid and complete. The requested schedule aligns with clinician availability. All system policies and procedures are being followed. Once your appointment is reviewed and accepted by an administrator, you will receive a confirmation notification.",
  },
  {
    id: 5,
    question: "Which browsers support the machine learning functionality?",
    answer:
      "The machine learning functionality works best with Google Chrome and Microsoft Edge. While it is compatible with most browsers, it is not operable on Opera and Firefox.",
  },
  {
    id: 6,
    question: "How do I register as a clinician or admin?",
    answer:
      "To register, your email must first be added to the system by authorized personnel. Once registered, you can create an account.",
  },
  {
    id: 7,
    question: "What happens if my account is archived?",
    answer:
      "Archived accounts will no longer have access to the system. Additionally, all associated appointments and schedules will be cleared.",
  },
];

const FaqItem = ({
  question,
  answer,
  id,
}: {
  question: string;
  answer: string | Array<string>;
  id: number;
}) => {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreRounded />}
        aria-controls={`panel${id}-content`}
        id={`panel${id}-header`}
      >
        <Typography component="span" fontWeight={600}>
          {question}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {Array.isArray(answer) ? (
          <ul>
            {answer.map((item, index) => (
              <Typography component="li" key={index}>
                <Typography
                  component="span"
                  sx={{ marginRight: 1, fontWeight: 600 }}
                >
                  {index + 1}
                </Typography>
                {item}
              </Typography>
            ))}
          </ul>
        ) : (
          <Typography variant="body1" fontWeight={400}>
            {answer}
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default function LandingFaq() {
  return (
    <Container maxWidth="lg" sx={{ padding: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="h3" fontWeight={700} sx={{ marginBottom: 2 }}>
          FAQ
        </Typography>
        <Typography variant="body1" fontWeight={400} sx={{ marginBottom: 2 }}>
          We prioritize your health by offering tailored services in speech
          therapy, online appointments, and teleconferencing consultations. Our
          highly qualified clinicians are here to guide you in choosing the best
          treatment options to meet your individual health needs. Let us help
          you find the right path to recovery.
        </Typography>

        {FaqList.map((item, index) => (
          <FaqItem
            key={index}
            id={item.id}
            question={item.question}
            answer={item.answer}
          />
        ))}
      </Box>
    </Container>
  );
}
