/* eslint-disable max-len */
export const DEFAULT_JPEG_TYPE = 'image/jpeg';
export const DEFAULT_PNG_TYPE = 'image/png';
export const INVALID_FILE_TYPE_ERROR = 'Le fichier choisi doit etre de type JPEG ou PNG';
export const IMAGE_QUANTITY_ERROR = 'Vous devez choisir 1 seule image';
export const NO_FILE_ERROR = 'Vous devez choisir 1 seul fichier';
export const JSON_PARSING_ERROR = 'Une erreur est survenue en parsant votre JSON';
export const INVALID_FORMAT_ERROR = 'Votre dictionnaire ne possède pas un format valide';
export const DUPLICATED_AVATAR = 'Cet avatar ne peut pas être ajouté car il existe déjà un avatar ayant le titre';
export const MAX_FILE_LENGTH = 8000000;
export const ONE_MB = 1000000;
export const FILE_TOO_BIG = `La taille de votre fichier ne doit pas dépasser ${MAX_FILE_LENGTH / ONE_MB}MB`;

export const SUCCESSFUL_EDIT_MESSAGE = 'Votre dictionnaire a été mis à jour';
export const SUCCESSFUL_UPLOAD_MESSAGE = 'Votre dictionnaire a été ajouté';
export const SUCCESSFUL_DELETE_MESSAGE = 'Votre dictionnaire a été effacé';
export const SUCCESSFUL_DELETE_ALL_MESSAGE = 'Vos dictionnaires ont tous a été effacés';

// Custom constraints not imposed by the teacher
export const TITLE_MAX_LENGTH = 64;
export const TITLE_MIN_LENGTH = 1;
export const DESCRIPTION_MAX_LENGTH = 64;
export const ACCEPTED_TITLE_SPECIAL_CHARACTERS = [' ', "'"];

// For the dictionary validator
export const TITLE_NOT_FOUND = 'Votre dictionnaire ne contient pas une clé "title" \nPar exemple: { "title": "joual" }';
export const DESCRIPTION_NOT_FOUND = 'Votre dictionnaire ne contient pas une clé description"\nPar exemple: { "description": "1800s slangs" }';
export const WORDS_NOT_FOUND = 'Votre dictionnaire ne contient pas une clé "words" \nPar exemple : { "words": ["toi", "moi"] }';

export const INVALID_DESCRIPTION_TYPE = 'La description de votre dictionnaire doit être une string\nPar exemple : { "description" : "mot" }';

export const LISTE_AVATARS = [
    'https://firebasestorage.googleapis.com/v0/b/polyscrabble-76a8b.appspot.com/o/avatars%2Fwoman1.png?alt=media&token=c4c15a55-7622-45d1-bd79-32223113833c',
    'https://firebasestorage.googleapis.com/v0/b/polyscrabble-76a8b.appspot.com/o/avatars%2Fwoman2.png?alt=media&token=1033d326-e7d1-435f-8807-bc07d75276e2',
    'https://firebasestorage.googleapis.com/v0/b/polyscrabble-76a8b.appspot.com/o/avatars%2Fwoman3.png?alt=media&token=288de51d-c1a8-433e-8c94-74a3ec7e2cc2',
    'https://firebasestorage.googleapis.com/v0/b/polyscrabble-76a8b.appspot.com/o/avatars%2Fman1.png?alt=media&token=36abb4df-ec7b-4288-876a-644f4e80f7f7',
    'https://firebasestorage.googleapis.com/v0/b/polyscrabble-76a8b.appspot.com/o/avatars%2Fman2.png?alt=media&token=4f548b43-4434-4b61-9a76-991b75021c97',
    'https://firebasestorage.googleapis.com/v0/b/polyscrabble-76a8b.appspot.com/o/avatars%2Fman3.png?alt=media&token=efbf0e9c-70b8-43f3-b50e-2bcd67ac1ea8',
];
export const ERROR_MESSAGE_UPLOAD = "Erreur durant le televersement de l'image";
export const INVALID_PICK = 500;
export const PICK_UPLOADED_AVATAR = 200;
export const POPUP_WIDTH = '600px';
export const POPUP_HEIGHT = '500px';
export const AVATAR_DEFAULT =
    'https://firebasestorage.googleapis.com/v0/b/polyscrabble-76a8b.appspot.com/o/avatars%2Fuser.png?alt=media&token=d4466fbb-f2ec-4fa5-ada0-dde6cb360f93';
