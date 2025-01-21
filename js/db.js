// db.js
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

    static async updateWorker(id, updates) {
        const { data, error } = await supabase
            .from('workers')
            .update(updates)
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
            .eq('status', 'active')
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

    static async createTruck(truckData) {
        const { data, error } = await supabase
            .from('trucks')
            .insert([truckData])
            .single();
            
        if (error) throw error;
        return data;
    }

    // Inspections operations
    static async createInspection(inspectionData) {
        const { data, error } = await supabase
            .from('inspections')
            .insert([{
                ...inspectionData,
                start_time: new Date().toISOString(),
                status: 'completed'
            }])
            .single();
            
        if (error) throw error;
        return data;
    }

    static async getInspections(filters = {}) {
        let query = supabase
            .from('inspections')
            .select(`
                *,
                worker:workers(name),
                truck:trucks(model)
            `);

        // Apply filters if they exist
        if (filters.workerId) {
            query = query.eq('worker_id', filters.workerId);
        }
        if (filters.truckId) {
            query = query.eq('truck_id', filters.truckId);
        }
        if (filters.startDate && filters.endDate) {
            query = query
                .gte('created_at', filters.startDate)
                .lte('created_at', filters.endDate);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
            
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
            
        if (error) throw error;
        return data;
    }

    static async updateInspection(id, updates) {
        const { data, error } = await supabase
            .from('inspections')
            .update({
                ...updates,
                end_time: new Date().toISOString()
            })
            .eq('id', id)
            .single();
            
        if (error) throw error;
        return data;
    }

    // Metrics operations
    static async getFleetMetrics(startDate, endDate) {
        const { data, error } = await supabase
            .from('metrics_cache')
            .select('*')
            .eq('metric_type', 'fleet_condition')
            .gte('start_date', startDate)
            .lte('end_date', endDate)
            .single();

        if (error) {
            // If no cached metrics, calculate them
            const { data: inspections } = await supabase
                .from('inspections')
                .select('overall_condition')
                .gte('created_at', startDate)
                .lte('created_at', endDate);

            const averageCondition = inspections.reduce((acc, curr) => 
                acc + curr.overall_condition, 0) / inspections.length;

            return {
                fleet_condition: averageCondition,
                calculation_date: new Date().toISOString()
            };
        }

        return data;
    }

    // Error logging
    static async logError(error, context) {
        console.error('Database error:', error);
        console.error('Context:', context);
        // You could also send this to a logging service
    }
}
