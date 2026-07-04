import React, { useState, useEffect } from 'react';
import { 
  EditMode, 
  ImageAdjustments, 
  CropState,
  OverlayItem
} from '../types';
import { 
  Crop, 
  Sliders, 
  Droplet, 
  Type, 
  RotateCcw, 
  Trash2, 
  Undo,
  Heading,
  Smile,
  Plus,
  Image as ImageIcon,
  Upload
} from 'lucide-react';

interface ToolbarProps {
  editMode: EditMode;
  setEditMode: (mode: EditMode) => void;
  
  // Adjustments props
  adjustments: ImageAdjustments;
  onAdjustmentsChange: (adjustments: ImageAdjustments) => void;
  
  // Crop props
  activeCropRatio: string;
  onCropRatioChange: (ratio: string) => void;
  onApplyCrop: () => void;
  onResetCrop: () => void;
  onCenterCrop: () => void;
  
  // Brush Blur props
  brushSize: number;
  setBrushSize: (size: number) => void;
  brushStrength: number;
  setBrushStrength: (strength: number) => void;
  onUndoStroke: () => void;
  onClearStrokes: () => void;
  strokeCount: number;

  // Overlay add trigger
  onAddOverlay: (type: 'text' | 'emoji' | 'custom_image', content: string, color: string, fontFamily: string, size: number) => void;

  // Selected Overlay editing props
  selectedOverlayId: string | null;
  setSelectedOverlayId: (id: string | null) => void;
  overlays: OverlayItem[];
  onUpdateOverlays: (overlays: OverlayItem[]) => void;
}

const FONTS_LIST = [
  { id: 'Inter', name: 'Sans (Inter)' },
  { id: 'Space Grotesk', name: 'Tech (Space Grotest)' },
  { id: 'Playfair Display', name: 'Luxe (Playfair)' },
  { id: 'JetBrains Mono', name: 'Mono (Coding)' },
  { id: 'Pacifico', name: 'Script (Pacifico)' },
  { id: 'Bangers', name: 'Pop (Bangers)' }
];

const QUICK_EMOJIS = ['😀', '😎', '👍', '❤️', '🔥', '🎉', '🚀', '✨', '💡', '📸', '🗺️', '🎨', '💼', '🍕', '🌸', '⚠️'];

const ASPECT_RATIOS = [
  { value: 'free', label: 'Libre' },
  { value: '1:1', label: '1:1 (Carré)' },
  { value: '4:5', label: '4:5 (Insta)' },
  { value: '3:4', label: '3:4' },
  { value: '9:16', label: '9:16 (Story)' },
  { value: '4:3', label: '4:3 (Paysage)' },
  { value: '16:9', label: '16:9 (TV)' },
  { value: '2:1', label: '2:1 (Cinema)' },
];

export default function Toolbar({
  editMode,
  setEditMode,
  adjustments,
  onAdjustmentsChange,
  activeCropRatio,
  onCropRatioChange,
  onApplyCrop,
  onResetCrop,
  onCenterCrop,
  brushSize,
  setBrushSize,
  brushStrength,
  setBrushStrength,
  onUndoStroke,
  onClearStrokes,
  strokeCount,
  onAddOverlay,
  selectedOverlayId,
  setSelectedOverlayId,
  overlays,
  onUpdateOverlays
}: ToolbarProps) {
  // Overlay form states
  const [overlayTab, setOverlayTab] = useState<'text' | 'emoji' | 'custom_image'>('text');
  const [textVal, setTextVal] = useState('Impressionnant');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textFont, setTextFont] = useState('Inter');
  const [lastUsedSizes, setLastUsedSizes] = useState<Record<'text' | 'emoji' | 'custom_image', number>>({
    text: 8,
    emoji: 12,
    custom_image: 12
  });
  const [customEmoji, setCustomEmoji] = useState('');
  const [customIcons, setCustomIcons] = useState<string[]>([]);

  const selectedOverlay = overlays?.find(o => o.id === selectedOverlayId) || null;

  // Track the size of any currently selected and resized overlay to remember it for future elements of the same type
  useEffect(() => {
    if (selectedOverlay) {
      setLastUsedSizes(prev => ({
        ...prev,
        [selectedOverlay.type]: selectedOverlay.size
      }));
    }
  }, [selectedOverlay?.id, selectedOverlay?.size, selectedOverlay?.type]);

  const handleCustomIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        // Add to session in-memory list
        setCustomIcons((prev) => [...prev, dataUrl]);
        // Also immediately add it to the image as a new overlay using the last used custom_image size!
        onAddOverlay('custom_image', dataUrl, '', '', lastUsedSizes.custom_image);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input value so same file can be uploaded again if needed
    e.target.value = '';
  };

  const handleAddCustomIcon = (dataUrl: string) => {
    onAddOverlay('custom_image', dataUrl, '', '', lastUsedSizes.custom_image);
  };

  const handleUpdateSelectedOverlay = (fields: Partial<OverlayItem>) => {
    if (!selectedOverlay) return;
    const updated = overlays.map(ov => ov.id === selectedOverlay.id ? { ...ov, ...fields } : ov);
    onUpdateOverlays(updated);
  };

  const handleDeleteSelectedOverlay = () => {
    if (!selectedOverlay) return;
    const updated = overlays.filter(ov => ov.id !== selectedOverlay.id);
    onUpdateOverlays(updated);
    setSelectedOverlayId(null);
  };

  const updateAdjust = <K extends keyof ImageAdjustments>(key: K, val: number) => {
    onAdjustmentsChange({
      ...adjustments,
      [key]: val
    });
  };

  const handleResetFilters = () => {
    onAdjustmentsChange({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      generalBlur: 0
    });
  };

  const handleAddText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textVal.trim()) return;
    onAddOverlay('text', textVal, textColor, textFont, lastUsedSizes.text);
  };

  const handleAddEmoji = (emoji: string) => {
    onAddOverlay('emoji', emoji, '', 'system-ui', lastUsedSizes.emoji);
  };

  return (
    <div id="toolbar-container" className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/40 p-4 flex flex-col h-full overflow-hidden select-none">
      
      {/* Category Tabs */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Modes de retouche</label>
        <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          
          {/* CROP MODE */}
          <button
            id="tab-crop"
            onClick={() => setEditMode(editMode === 'crop' ? 'none' : 'crop')}
            title="Recadrer l'image"
            className={`flex flex-col items-center justify-center py-2.5 rounded-lg transition-all cursor-pointer ${
              editMode === 'crop'
                ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Crop className="w-4 h-4 mb-1" />
            <span className="text-[9.5px]">Cadrer</span>
          </button>

          {/* ADJUST FILTER MODE */}
          <button
            id="tab-adjust"
            onClick={() => setEditMode(editMode === 'adjust' ? 'none' : 'adjust')}
            title="Ajuster luminosité, contraste et saturation"
            className={`flex flex-col items-center justify-center py-2.5 rounded-lg transition-all cursor-pointer ${
              editMode === 'adjust'
                ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Sliders className="w-4 h-4 mb-1" />
            <span className="text-[9.5px]">Ajuster</span>
          </button>

          {/* BRUSH BLUR MODE */}
          <button
            id="tab-blur"
            onClick={() => setEditMode(editMode === 'blur_brush' ? 'none' : 'blur_brush')}
            title="Flouter des visages ou parties d'image au pinceau"
            className={`flex flex-col items-center justify-center py-2.5 rounded-lg transition-all cursor-pointer ${
              editMode === 'blur_brush'
                ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Droplet className="w-4 h-4 mb-1" />
            <span className="text-[9.5px]">Flouter</span>
          </button>

          {/* TEXT OVERLAY MODE */}
          <button
            id="tab-text"
            onClick={() => setEditMode(editMode === 'text_overlay' ? 'none' : 'text_overlay')}
            title="Ajouter du texte ou des émojis"
            className={`flex flex-col items-center justify-center py-2.5 rounded-lg transition-all cursor-pointer ${
              editMode === 'text_overlay'
                ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Type className="w-4 h-4 mb-1" />
            <span className="text-[9.5px]">Éléments</span>
          </button>
        </div>
      </div>

      {/* Context Settings Area */}
      <div className="flex-1 overflow-y-auto mt-5 rounded-2xl bg-slate-950/45 border border-slate-800/40 p-3.5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 hover:scrollbar-thumb-slate-700">
        
        {/* NONE MODE / DEFAULT WELCOME PANEL */}
        {editMode === 'none' && (
          <div id="default-help-panel" className="h-full flex flex-col items-center justify-center text-center p-4">
            <Sliders className="w-9 h-9 text-slate-700 mb-3 animate-pulse" />
            <h4 className="text-slate-300 text-xs font-semibold leading-relaxed">Prêt à retoucher</h4>
            <p className="text-slate-500 text-[10.5px] mt-1.5 leading-relaxed">
              Sélectionnez l'un des modes ci-dessus pour appliquer des transformations sur la photo active.
            </p>
          </div>
        )}

        {/* CROP WORKSPACE */}
        {editMode === 'crop' && (
          <div id="crop-toolbar-section" className="space-y-4 animate-fadeIn">
            <div>
              <h4 className="text-slate-200 text-xs font-bold flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5 text-emerald-400" />
                Rognage & Recadrage
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                Définissez les proportions voulues, puis ajustez la zone lumineuse sur la photo centrale.
              </p>
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Format d'aspect</span>
              <div className="grid grid-cols-2 gap-1.5">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.value}
                    id={`ratio-btn-${ratio.value}`}
                    onClick={() => onCropRatioChange(ratio.value)}
                    className={`py-1.5 px-2 bg-slate-900/40 hover:bg-slate-800 hover:text-slate-100 rounded-lg text-[11px] font-medium transition-all text-left flex items-center justify-between border ${
                      activeCropRatio === ratio.value
                        ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400 font-semibold'
                        : 'border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <span>{ratio.label}</span>
                    <span className="text-[9px] font-mono opacity-60">
                      {ratio.value !== 'free' ? ratio.value : '★'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions for Crop */}
            <div className="space-y-2 pt-3 border-t border-slate-900 flex flex-col gap-2">
              <button
                id="apply-crop-btn"
                onClick={onApplyCrop}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans text-xs font-bold rounded-lg transition-all cursor-pointer text-center flex items-center justify-center shadow-lg shadow-emerald-950/40"
              >
                Appliquer le recadrage
              </button>

              <button
                id="center-crop-btn"
                onClick={onCenterCrop}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-sans text-xs font-medium rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Centrer le cadrage actif
              </button>

              <button
                id="reset-crop-btn"
                onClick={onResetCrop}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-450 hover:text-slate-300 font-sans text-xs font-medium rounded-lg transition-all cursor-pointer text-center"
              >
                Réinitialiser la taille d'origine
              </button>
            </div>
          </div>
        )}

        {/* FILTERS AND ADJUSTMENT SLIDERS */}
        {editMode === 'adjust' && (
          <div id="adjust-toolbar-section" className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h4 className="text-slate-200 text-xs font-bold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                Filtres & Lumière
              </h4>
              <button
                id="reset-adjust-btn"
                onClick={handleResetFilters}
                title="Remettre à zéro"
                className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-emerald-500/70" />
                Réinitialiser
              </button>
            </div>

            {/* Luminosity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-slate-400">
                <span>Luminosité</span>
                <span className="text-emerald-400 font-semibold font-mono">{adjustments.brightness}%</span>
              </div>
              <input
                id="adjust-brightness-slider"
                type="range"
                min="0"
                max="200"
                value={adjustments.brightness}
                onChange={(e) => updateAdjust('brightness', parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Contrast Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-slate-400">
                <span>Contraste</span>
                <span className="text-emerald-400 font-semibold font-mono">{adjustments.contrast}%</span>
              </div>
              <input
                id="adjust-contrast-slider"
                type="range"
                min="0"
                max="200"
                value={adjustments.contrast}
                onChange={(e) => updateAdjust('contrast', parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Saturation Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-slate-400">
                <span>Saturation</span>
                <span className="text-emerald-400 font-semibold font-mono">{adjustments.saturation}%</span>
              </div>
              <input
                id="adjust-saturation-slider"
                type="range"
                min="0"
                max="200"
                value={adjustments.saturation}
                onChange={(e) => updateAdjust('saturation', parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* BRUSH BLUR SYSTEM */}
        {editMode === 'blur_brush' && (
          <div id="blur-toolbar-section" className="space-y-4 animate-fadeIn">
            <div>
              <h4 className="text-slate-200 text-xs font-bold flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-rose-400" />
                Options de Floutage
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                Appliquez un flou général sur l'image entière ou peignez des zones au pinceau pour les anonymiser.
              </p>
            </div>

            {/* General Blur (flouter image entière) */}
            <div className="space-y-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50">
              <div className="flex justify-between text-[11px] font-medium text-slate-400">
                <span className="font-semibold text-slate-300">1. Flou global (Image entière)</span>
                <span className="text-rose-400 font-semibold font-mono">{adjustments.generalBlur} px</span>
              </div>
              <input
                id="adjust-blur-slider"
                type="range"
                min="0"
                max="50"
                value={adjustments.generalBlur}
                onChange={(e) => updateAdjust('generalBlur', parseInt(e.target.value))}
                className="w-full accent-rose-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer mt-1"
              />
            </div>

            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider pt-2 border-t border-slate-900/50">
              2. Floutage ciblé au pinceau
            </div>

            {/* Brush Size Adjustment */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-slate-400">
                <span>Taille du pinceau</span>
                <span className="text-emerald-400 font-semibold font-mono">{brushSize} px</span>
              </div>
              <input
                id="brush-size-slider"
                type="range"
                min="10"
                max="150"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Brush Strength Blur */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-slate-400">
                <span>Puissance du floutage</span>
                <span className="text-emerald-400 font-semibold font-mono">{brushStrength} px</span>
              </div>
              <input
                id="brush-strength-slider"
                type="range"
                min="5"
                max="100"
                value={brushStrength}
                onChange={(e) => setBrushStrength(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* History Action Loops */}
            <div className="space-y-2 pt-3 border-t border-slate-900">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-between">
                <span>Tracés appliqués</span>
                <span className="font-mono text-emerald-400">{strokeCount} strokes</span>
              </span>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  id="undo-stroke-btn"
                  disabled={strokeCount === 0}
                  onClick={onUndoStroke}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 cursor-pointer disabled:pointer-events-none transition-colors"
                >
                  <Undo className="w-3.5 h-3.5 text-slate-400" />
                  Annuler
                </button>

                <button
                  id="clear-strokes-btn"
                  disabled={strokeCount === 0}
                  onClick={onClearStrokes}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-950 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900/40 text-slate-400 hover:text-rose-400 rounded-lg text-xs font-semibold disabled:opacity-40 cursor-pointer disabled:pointer-events-none transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Effacer tout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OVERLAYS SYSTEM */}
        {editMode === 'text_overlay' && (
          <div id="overlays-toolbar-section" className="space-y-4 animate-fadeIn">
            {selectedOverlay ? (
              // ACTIVE SELECTED OVERLAY EDITING BLOCK
              <div className="space-y-4 animate-fadeIn bg-slate-900/40 p-3 rounded-xl border border-emerald-500/20">
                <div>
                  <h4 className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5" />
                    Modifier l'élément
                  </h4>
                  <span className="text-[10px] text-slate-500 mt-1 block leading-normal">
                    Modifiez le contenu, la taille et le style directement ci-dessous.
                  </span>
                </div>

                {/* Edit Text Content */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Contenu de l'élément</span>
                  <input
                    id="edit-overlay-content"
                    type="text"
                    required
                    value={selectedOverlay.content}
                    onChange={(e) => handleUpdateSelectedOverlay({ content: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs px-2.5 py-1.5 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {selectedOverlay.type === 'text' && (
                  <>
                    {/* Font Selector */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Police de caractère</span>
                      <select
                        id="edit-text-font"
                        value={selectedOverlay.fontFamily}
                        onChange={(e) => handleUpdateSelectedOverlay({ fontFamily: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs px-2.5 py-1.5 outline-none focus:border-emerald-500 transition-colors"
                      >
                        {FONTS_LIST.map((f) => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Color Selector */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Couleur du texte</span>
                      <div className="flex items-center gap-2">
                        <input
                          id="edit-text-color-picker"
                          type="color"
                          value={selectedOverlay.color}
                          onChange={(e) => handleUpdateSelectedOverlay({ color: e.target.value })}
                          className="w-8 h-8 rounded-lg overflow-hidden border border-slate-800/80 bg-slate-950 focus:outline-none p-0 cursor-pointer flex-none [color-scheme:dark]"
                        />
                        <input
                          id="edit-text-color-hex"
                          type="text"
                          value={selectedOverlay.color}
                          onChange={(e) => handleUpdateSelectedOverlay({ color: e.target.value })}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs px-2 py-1.5 outline-none focus:border-emerald-500 uppercase font-mono"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Font Scale Size */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-medium text-slate-400">
                    <span>Taille relative</span>
                    <span className="text-emerald-400 font-bold font-mono">{selectedOverlay.size}%</span>
                  </div>
                  <input
                    id="edit-overlay-size"
                    type="range"
                    min="1"
                    max="45"
                    step="0.5"
                    value={selectedOverlay.size}
                    onChange={(e) => handleUpdateSelectedOverlay({ size: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    id="deselect-overlay-btn"
                    onClick={() => setSelectedOverlayId(null)}
                    className="py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Valider
                  </button>
                  <button
                    id="delete-overlay-btn"
                    onClick={handleDeleteSelectedOverlay}
                    className="py-2 bg-rose-950/65 hover:bg-rose-900 border border-rose-900/50 text-rose-300 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              // DEFAULT NEW ELEMENT CREATION PANEL
              <>
                <div>
                  <h4 className="text-slate-200 text-xs font-bold flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-emerald-400" />
                    Ajouter du Texte, Émojis & Icônes
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                    Ajoutez des titres, autocollants ou icônes personnalisées. Ajustez la taille et tirez pour les placer librement.
                  </p>
                </div>

                {/* Element Tabs (Texte vs Emoji vs Custom) */}
                <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800/60 font-sans">
                  <button
                    id="tab-overlay-text"
                    onClick={() => setOverlayTab('text')}
                    className={`py-1 rounded-md text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      overlayTab === 'text'
                        ? 'bg-slate-800 text-emerald-400 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Heading className="w-3 h-3" />
                    Texte
                  </button>
                  
                  <button
                    id="tab-overlay-emoji"
                    onClick={() => setOverlayTab('emoji')}
                    className={`py-1 rounded-md text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      overlayTab === 'emoji'
                        ? 'bg-slate-800 text-emerald-400 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smile className="w-3 h-3" />
                    Émojis
                  </button>

                  <button
                    id="tab-overlay-custom"
                    onClick={() => setOverlayTab('custom_image')}
                    className={`py-1 rounded-md text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      overlayTab === 'custom_image'
                        ? 'bg-slate-800 text-emerald-400 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    Perso
                  </button>
                </div>

                {/* TEXT SUB-FORM */}
                {overlayTab === 'text' && (
                  <form onSubmit={handleAddText} className="space-y-3 pt-1">
                    {/* Text Content */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Votre texte</span>
                      <input
                        id="text-content-input"
                        type="text"
                        required
                        value={textVal}
                        onChange={(e) => setTextVal(e.target.value)}
                        placeholder="Écrivez quelque chose..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs px-2.5 py-1.5 outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    {/* Font Selector */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Police de caractère</span>
                      <select
                        id="text-font-selector"
                        value={textFont}
                        onChange={(e) => setTextFont(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs px-2.5 py-1.5 outline-none focus:border-emerald-500 transition-colors"
                      >
                        {FONTS_LIST.map((f) => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Color Selector */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Couleur du texte</span>
                      <div className="flex items-center gap-2">
                        <input
                          id="text-color-picker"
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-8 h-8 rounded-lg overflow-hidden border border-slate-800/80 bg-slate-900 focus:outline-none p-0 cursor-pointer flex-none [color-scheme:dark]"
                        />
                        <input
                          id="text-color-hex-input"
                          type="text"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs px-2 py-1.5 outline-none focus:border-emerald-500 uppercase font-mono"
                        />
                      </div>
                    </div>

                    {/* Submit button */}
                    <button
                      id="add-text-btn"
                      type="submit"
                      className="w-full mt-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-sans text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter le texte
                    </button>
                  </form>
                )}

                {/* EMOJIS GRID */}
                {overlayTab === 'emoji' && (
                  <div className="space-y-4 pt-1 animate-fadeIn">
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Cliquez pour ajouter direct</span>
                      <div className="grid grid-cols-4 gap-2 font-sans">
                        {QUICK_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            id={`emoji-btn-${emoji}`}
                            onClick={() => handleAddEmoji(emoji)}
                            title="Ajouter cet émoji"
                            className="p-2.5 bg-slate-900 border border-slate-800/80 hover:bg-slate-800/60 rounded-xl text-xl flex items-center justify-center cursor-pointer transition-transform transform active:scale-95 animate-fadeIn"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Emoji Form */}
                    <div className="space-y-1.5 pt-3 border-t border-slate-900 animate-fadeIn">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Un autre émoji spécifique ?</span>
                      <div className="flex gap-1.5 font-sans">
                        <input
                          id="emoji-custom-input"
                          type="text"
                          maxLength={4}
                          value={customEmoji}
                          onChange={(e) => setCustomEmoji(e.target.value)}
                          placeholder="💡"
                          className="w-16 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-center text-sm px-2.5 py-1.5 outline-none focus:border-emerald-500"
                        />
                        <button
                          id="add-custom-emoji-btn"
                          onClick={() => {
                            if (customEmoji.trim()) {
                              handleAddEmoji(customEmoji.trim());
                              setCustomEmoji('');
                            }
                          }}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold py-1.5 px-3 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* CUSTOM IMAGE UPLOADER & GRID */}
                {overlayTab === 'custom_image' && (
                  <div className="space-y-4 pt-1 animate-fadeIn">
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Importer une icône (.png, .jpg, .svg, etc.)</span>
                      
                      <label 
                        className="flex flex-col items-center justify-center border border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-900/60 hover:bg-slate-900/90 rounded-xl p-4 cursor-pointer transition-all group/upload"
                      >
                        <Upload className="w-5 h-5 text-slate-500 group-hover/upload:text-emerald-400 mb-1.5 transition-colors" />
                        <span className="text-[11px] text-slate-400 font-medium group-hover/upload:text-slate-200">Choisir un fichier</span>
                        <span className="text-[9px] text-slate-650 mt-1">SVG, PNG, JPG... gardé en mémoire</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleCustomIconUpload} 
                        />
                      </label>
                    </div>

                    {/* In-Memory Custom Icons Gallery */}
                    {customIcons.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-900 animate-fadeIn">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Vos icônes de la session ({customIcons.length})</span>
                        <div className="grid grid-cols-4 gap-2">
                          {customIcons.map((dataUrl, idx) => (
                            <button
                              key={idx}
                              id={`custom-icon-btn-${idx}`}
                              onClick={() => handleAddCustomIcon(dataUrl)}
                              title="Ajouter à l'image"
                              className="relative p-1.5 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-lg flex items-center justify-center cursor-pointer transition-all group h-12"
                            >
                              <img 
                                src={dataUrl} 
                                referrerPolicy="no-referrer"
                                className="max-w-full max-h-full object-contain pointer-events-none group-hover:scale-105 transition-transform" 
                                alt="Custom icon template" 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Help Overlay Tips */}
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/40 text-[9.5px] text-slate-500 leading-normal font-sans">
              💡 Des poignées de rotation, édition rapide et de suppression individuelles s'affichent autour de l'élément sélectionné sur la photo. Double-cliquez pour éditer le texte en ligne !
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
