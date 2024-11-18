import { Textarea } from "@/components/ui/textarea";

interface SentenceFormProps {
  content: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
}

const SentenceForm = ({ content, onChange, isDisabled }: SentenceFormProps) => {
  return (
    <div className="mt-16">
      <h1 className="text-3xl font-serif mb-8 text-center">
        Jurnal Anda
      </h1>
      
      <div className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Pengalaman pribadi atau emosi apa yang muncul di pikiran Anda ketika membaca kalimat ini, dan mengapa? Renungkan bagaimana hal itu terhubung dengan kehidupan, nilai, atau pengalaman Anda, dan biarkan pikiran Anda mengalir untuk menemukan wawasan atau emosi baru."
          className="min-h-[200px] resize-y text-lg whitespace-pre-wrap"
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};

export default SentenceForm;