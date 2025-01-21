import { supabase } from '../backend/supabaseClient.js';

export class DatabaseService {
    // Workers (Users) operations
    static async getWorkers() {
        const { data, error } = await supabase
            .from('workers')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data;
    }

    static async getWorkerById(id) {
        const { data, error } = await supabase
            .from('workers')
            .select('*')
            .eq('id', id)
            .single();
            
        if (error) throw error;
        return data;
    }

    // Trucks operations
    static async getTrucks() {
        const { data, error } = await supabase
            .from('trucks')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data;
    }

    static async getTruckById(id) {
        const { data, error } = await supabase
            .from('trucks')
            .select('*')
            .eq('id', id)
            .single();
            
        if (error) throw error;
        return data;
    }

    static async updateTruck(id, updates) {
        const { data, error } = await supabase
            .from('trucks')
            .update(updates)
            .eq('id', id)
            .single();
            
        if (error) throw error;
        return data;
    }

    // Inspections operations
    static async createInspection(inspectionData) {
        const { data, error } = await supabase
            .from('inspections')
            .insert([inspectionData])
            .single();
            
        if (error) throw error;
        return data;
    }

    static async getInspections() {
        const { data, error } = await supabase
            .from('inspections')
            .select(`
                *,
                worker:workers(name),
                truck:trucks(model)
            `)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data;
    }

    static async getInspectionById(id) {
        const { data, error } = await supabase
            .from('inspections')
            .select(`
                *,
                worker:workers(name),
                truck:trucks(model)
            `)
            .eq('id', id)
            .single();
