"use client"
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import { useEffect } from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";

export default function Home() {

    useEffect(() => {
        document.title = "Smart Village | Home";
        async function fetchData() {
            try {
                const res = await fetch(
                    "http://43.229.149.138:8080/smart_village/api/auth/login",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            username: "admin",
                            password: "1234",
                        }),
                    }
                );
                const json = await res.json();
                console.log(json);
            } catch (err) {
                console.error(err);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-7">
                <EcommerceMetrics />
                <MonthlySalesChart />
            </div>

            <div className="col-span-12 xl:col-span-5">
                <MonthlyTarget />
            </div>

            <div className="col-span-12">
                <StatisticsChart />
            </div>

            <div className="col-span-12 xl:col-span-5">
                <DemographicCard />
            </div>

            <div className="col-span-12 xl:col-span-7">
                <RecentOrders />
            </div>
        </div>
    );
}