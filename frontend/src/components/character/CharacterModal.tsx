import {
  modalBackdrop,
  modalCard,
  sectionLabel,
  characterName,
  classification,
  bodyText,
  closeButton,
} from "./CharacterModal.styles";

interface CharacterModalProps {
  open: boolean;
  onClose: () => void;
}

const CharacterModal = ({ open, onClose }: CharacterModalProps) => {
  if (!open) return null;

  return (
    <div
      className={modalBackdrop()}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Artyom personnel data log"
    >
      <div className={modalCard()} onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-metro-hud/40 to-transparent" />

        <div className={sectionLabel()}>// DATA LOG — PERSONNEL FILE</div>

        <h2 className={characterName()}>ARTYOM</h2>
        <p className={classification()}>
          CLASSIFICATION: HERO OF METRO/ D6 SOLDIER / SURVIVOR
        </p>

        <div className={bodyText()}>
          <p>
            Artyom is a silent observer of a broken world. A survivor shaped by
            darkness, tunnels, and the ghosts of humanity.
          </p>
          <p>
            He walks the endless Metro, where danger and hope coexist in the dim
            amber glow of failing lights. Every station tells a story; every
            shadow hides a threat.
          </p>
          <p>
            Born in the tunnels, raised by echoes. His words are rare — but when
            he speaks, the Metro listens.
          </p>
        </div>

        <div className="mt-6 flex justify-end sm:mt-8">
          <button
            onClick={onClose}
            className={closeButton()}
            aria-label="Close data log"
          >
            [CLOSE LOG]
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-metro-hud/20 to-transparent" />
      </div>
    </div>
  );
};

export default CharacterModal;
