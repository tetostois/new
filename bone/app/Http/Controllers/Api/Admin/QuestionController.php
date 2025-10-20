<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExamQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QuestionController extends Controller
{
    public function index(Request $request)
    {
        $query = ExamQuestion::query();
        if ($request->filled('certification_type')) {
            $query->where('certification_type', $request->certification_type);
        }
        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }
        if ($request->filled('is_published')) {
            $query->where('is_published', filter_var($request->is_published, FILTER_VALIDATE_BOOLEAN));
        }
        $perPage = (int) $request->query('per_page', 20);
        $perPage = $perPage > 0 ? min($perPage, 100) : 20;
        $questions = $query->orderByDesc('id')->paginate($perPage);
        return response()->json([
            'success' => true,
            'data' => $questions->items(),
            'pagination' => [
                'current_page' => $questions->currentPage(),
                'per_page' => $questions->perPage(),
                'total' => $questions->total(),
                'last_page' => $questions->lastPage(),
                'from' => $questions->firstItem(),
                'to' => $questions->lastItem(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'certification_type' => 'required|string|max:255',
            'module' => 'required|string|max:255',
            'question_type' => 'required|in:qcm,free_text',
            'question_text' => 'required|string',
            'reference_answer' => 'nullable|string',
            'instructions' => 'nullable|string',
            'points' => 'required|integer|min:1',
            'time_limit' => 'required|integer|min:10',
            'is_required' => 'boolean',
            'answer_options' => 'nullable|array',
            'answer_options.*.id' => 'nullable|string',
            'answer_options.*.text' => 'required_with:answer_options|string',
            'answer_options.*.isCorrect' => 'required_with:answer_options|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation échouée', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if ($data['question_type'] === 'qcm') {
            $options = $data['answer_options'] ?? [];
            if (count($options) < 2) {
                return response()->json(['message' => 'Validation échouée', 'errors' => ['answer_options' => ['Au moins 2 options sont requises']]], 422);
            }
            $hasCorrect = collect($options)->contains(function ($opt) { return !empty($opt['isCorrect']); });
            if (!$hasCorrect) {
                return response()->json(['message' => 'Validation échouée', 'errors' => ['answer_options' => ['Au moins une option correcte est requise']]], 422);
            }
        } else {
            $data['answer_options'] = null;
        }

        $question = ExamQuestion::create([
            'certification_type' => $data['certification_type'],
            'module' => $data['module'],
            'question_type' => $data['question_type'],
            'question_text' => $data['question_text'],
            'reference_answer' => $data['reference_answer'] ?? null,
            'instructions' => $data['instructions'] ?? null,
            'points' => $data['points'],
            'time_limit' => $data['time_limit'],
            'is_required' => (bool)($data['is_required'] ?? true),
            'answer_options' => $data['answer_options'] ?? null,
        ]);

        return response()->json(['message' => 'Question créée', 'question' => $question], 201);
    }

    public function update($id, Request $request)
    {
        $question = ExamQuestion::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'question_text' => 'sometimes|required|string',
            'reference_answer' => 'nullable|string',
            'instructions' => 'nullable|string',
            'points' => 'sometimes|required|integer|min:1',
            'time_limit' => 'sometimes|required|integer|min:10',
            'is_required' => 'boolean',
            'answer_options' => 'nullable|array',
            'answer_options.*.id' => 'nullable|string',
            'answer_options.*.text' => 'required_with:answer_options|string',
            'answer_options.*.isCorrect' => 'required_with:answer_options|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation échouée', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Si QCM, vérifier de nouveau les options si fournies
        if ($question->question_type === 'qcm' && array_key_exists('answer_options', $data)) {
            $options = $data['answer_options'] ?? [];
            if (count($options) < 2) {
                return response()->json(['message' => 'Validation échouée', 'errors' => ['answer_options' => ['Au moins 2 options sont requises']]], 422);
            }
            $hasCorrect = collect($options)->contains(function ($opt) { return !empty($opt['isCorrect']); });
            if (!$hasCorrect) {
                return response()->json(['message' => 'Validation échouée', 'errors' => ['answer_options' => ['Au moins une option correcte est requise']]], 422);
            }
        }

        $question->fill($data);
        $question->save();

        return response()->json(['message' => 'Question mise à jour', 'question' => $question]);
    }

    public function destroy($id)
    {
        $question = ExamQuestion::findOrFail($id);
        $question->delete();
        return response()->json(['message' => 'Question supprimée']);
    }
}
