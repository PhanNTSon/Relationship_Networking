import { useState, useCallback } from 'react';
import { supabase } from '../components/supabaseClient';

export function usePersons() {
    const [rawPersons, setRawPersons] = useState([]);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    const fetchPersons = useCallback(async (setPersonsCtx) => {
        setIsMapLoaded(false);
        const { data, error } = await supabase
            .from("persons")
            .select(`
            *,
            person_relationships!fk_person (
                related_person_id,
                relationship_id,
                relationships (
                    type
                )
            )
        `);

        if (error) {
            console.error(error);
            return;
        }

        const formatted = data.map(person => ({
            ...person,
            relationships: (person.person_relationships || []).map(rel => ({
                id: rel.related_person_id,
                typeId: rel.relationship_id,
                type: rel.relationships?.type
            }))
        }));

        setRawPersons(formatted);
        if (setPersonsCtx) {
            setPersonsCtx(formatted.map(p => [p.id, p]));
        }
        setTimeout(() => setIsMapLoaded(true), 500);
    }, []);

    const uploadAvatar = async (file) => {
        const fileName = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);

        return publicData.publicUrl;
    };

    const addPerson = async (formData) => {
        let avatarUrl = null;
        if (formData.avatar instanceof File) {
            avatarUrl = await uploadAvatar(formData.avatar);
        }

        const { data: personData, error: personError } = await supabase
            .from("persons")
            .insert([{
                name: formData.name,
                birth_date: formData.birth_date,
                death_date: formData.death_date || null,
                gender: formData.gender,
                lat: formData.lat ? Number(formData.lat) : null,
                lon: formData.lon ? Number(formData.lon) : null,
                avatar: avatarUrl
            }])
            .select()
            .single();

        if (personError) throw personError;

        const newPersonId = personData.id;

        const relationshipInserts = formData.relationships
            .filter(r => r.type && r.personId)
            .map(r => ({
                person_id: newPersonId,
                related_person_id: Number(r.personId),
                relationship_id: Number(r.type)
            }));

        if (relationshipInserts.length > 0) {
            const { error: relError } = await supabase
                .from("person_relationships")
                .insert(relationshipInserts);

            if (relError) throw relError;
        }

        return newPersonId;
    };

    const updatePerson = async (id, formData) => {
        let avatarUrl = formData.avatar instanceof File ? null : formData.avatar;
        if (formData.avatar instanceof File) {
            avatarUrl = await uploadAvatar(formData.avatar);
        }

        const updatePayload = {
            name: formData.name,
            birth_date: formData.birth_date,
            death_date: formData.death_date || null,
            gender: formData.gender,
            lat: formData.lat,
            lon: formData.lon
        };

        if (avatarUrl) {
            updatePayload.avatar = avatarUrl;
        }

        const { error } = await supabase
            .from("persons")
            .update(updatePayload)
            .eq("id", id);

        if (error) throw error;

        // Cập nhật relationships Bằng cách xóa hết và thêm lại
        await supabase.from("person_relationships").delete().eq("person_id", id);

        const relationshipInserts = formData.relationships
            .filter(r => r.type && r.personId)
            .map(r => ({
                person_id: id,
                related_person_id: Number(r.personId),
                relationship_id: Number(r.type)
            }));

        if (relationshipInserts.length > 0) {
            const { error: relError } = await supabase
                .from("person_relationships")
                .insert(relationshipInserts);

            if (relError) throw relError;
        }
    };

    return { rawPersons, isMapLoaded, fetchPersons, addPerson, updatePerson };
}
